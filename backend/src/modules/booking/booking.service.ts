import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ClientSession, Connection, Model, Types } from 'mongoose';
import { DEFAULT_PAGE, MAX_LIMIT } from '../../shared/constants/business-rules';
import { ERROR_CODES } from '../../shared/constants/error-codes';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CustomerResponseDto } from '../customer/dto/customer-response.dto';
import { CustomerService } from '../customer/customer.service';
import { ServiceResponseDto } from '../service/dto/service-response.dto';
import { ServiceService } from '../service/service.service';
import {
  ServiceOrder,
  ServiceOrderDocument,
  ServiceOrderStatus,
} from '../service-order/service-order.schema';
import { ServiceOrderService } from '../service-order/service-order.service';
import { AssignmentResponseDto } from '../staff-service-assignment/dto/assignment-response.dto';
import { StaffServiceAssignmentService } from '../staff-service-assignment/staff-service-assignment.service';
import {
  Booking,
  BookingDocument,
  BookingSource,
  BookingStatus,
} from './booking.schema';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import {
  CheckInBookingResponseDto,
  BookingResponseDto,
} from './dto/booking-response.dto';
import { CreateBookingOperatorDto } from './dto/create-booking-operator.dto';
import { CreateBookingPublicDto } from './dto/create-booking-public.dto';
import { BookingSortField, QueryBookingDto } from './dto/query-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { SlotAvailabilityService } from './slot-availability.service';

export interface BookingPaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface BookingCreatePayload {
  customer: CustomerResponseDto;
  service: ServiceResponseDto;
  assignment: AssignmentResponseDto;
  scheduledStart: Date;
  source: BookingSource;
  note?: string;
  createdBy?: string | null;
}

const BOOKING_CODE_RETRY_LIMIT = 3;
const CANCELLABLE_STATUSES = [
  BookingStatus.PENDING_OTP,
  BookingStatus.CONFIRMED,
  BookingStatus.CHECKED_IN,
  BookingStatus.IN_PROGRESS,
];
const PATCH_STATUS_TRANSITIONS: Partial<
  Record<BookingStatus, BookingStatus[]>
> = {
  [BookingStatus.CHECKED_IN]: [BookingStatus.IN_PROGRESS],
  [BookingStatus.IN_PROGRESS]: [BookingStatus.COMPLETED],
};

@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    @InjectConnection()
    private readonly connection: Connection,
    @InjectModel(ServiceOrder.name)
    private readonly serviceOrderModel: Model<ServiceOrderDocument>,
    private readonly customerService: CustomerService,
    private readonly serviceService: ServiceService,
    private readonly assignmentService: StaffServiceAssignmentService,
    private readonly serviceOrderService: ServiceOrderService,
    private readonly slotAvailabilityService: SlotAvailabilityService,
  ) {}

  /**
   * Generate a daily sequential booking code in BK-YYYYMMDD-NNNN format.
   */
  async generateBookingCode(session?: ClientSession): Promise<string> {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const query = this.bookingModel.countDocuments({
      created_at: { $gte: startOfDay, $lt: endOfDay },
    });
    if (session) {
      query.session(session);
    }

    const count = await query.exec();
    const datePart = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('');
    const sequence = String(count + 1).padStart(4, '0');

    return `BK-${datePart}-${sequence}`;
  }

  /**
   * Create a public landing-page booking and auto-create/reuse the customer by phone.
   */
  async createPublic(dto: CreateBookingPublicDto): Promise<BookingResponseDto> {
    const scheduledStart = this.parseDateTime(dto.scheduledStart);
    const customer = await this.customerService.findOrCreateByPhone({
      fullName: dto.fullName,
      phone: dto.phone,
      email: dto.email,
    });
    const prepared = await this.prepareBooking(dto.serviceId, scheduledStart);

    return this.createConfirmedBooking({
      customer,
      ...prepared,
      scheduledStart,
      source: BookingSource.LANDING_PAGE,
      note: dto.note,
      createdBy: null,
    });
  }

  /**
   * Create a public landing-page booking that waits for OTP confirmation.
   */
  async createPublicPendingOtp(
    dto: CreateBookingPublicDto,
  ): Promise<BookingResponseDto> {
    const scheduledStart = this.parseDateTime(dto.scheduledStart);
    const customer = await this.customerService.findOrCreateByPhone({
      fullName: dto.fullName,
      phone: dto.phone,
      email: dto.email,
    });
    const prepared = await this.prepareBooking(dto.serviceId, scheduledStart);

    return this.createBooking(
      {
        customer,
        ...prepared,
        scheduledStart,
        source: BookingSource.LANDING_PAGE,
        note: dto.note,
        createdBy: null,
      },
      BookingStatus.PENDING_OTP,
    );
  }

  /**
   * Create a booking on behalf of a selected customer.
   */
  async createOperator(
    dto: CreateBookingOperatorDto,
    currentUser: AuthenticatedUser,
  ): Promise<BookingResponseDto> {
    const scheduledStart = this.parseDateTime(dto.scheduledStart);
    const [customer, prepared] = await Promise.all([
      this.resolveActiveCustomer(dto.customerId),
      this.prepareBooking(dto.serviceId, scheduledStart),
    ]);

    return this.createConfirmedBooking({
      customer,
      ...prepared,
      scheduledStart,
      source: BookingSource.OPERATOR,
      note: dto.note,
      createdBy: currentUser.id,
    });
  }

  /**
   * Check in a confirmed booking and create an empty Service Order in one transaction.
   */
  async checkIn(
    bookingId: string,
    currentUser: AuthenticatedUser,
  ): Promise<CheckInBookingResponseDto> {
    const session = await this.connection.startSession();
    let result: CheckInBookingResponseDto | undefined;

    try {
      await session.withTransaction(async () => {
        const booking = await this.findBookingDocumentOrThrow(
          bookingId,
          session,
        );

        if (booking.status !== BookingStatus.CONFIRMED) {
          throw this.invalidStatusException();
        }

        booking.status = BookingStatus.CHECKED_IN;
        const serviceOrder = await this.serviceOrderService.create(
          {
            customerId: this.getObjectIdString(booking.customerId),
            bookingId,
            note: booking.note ?? '',
          },
          currentUser,
          session,
        );

        booking.serviceOrderId = new Types.ObjectId(serviceOrder.id);
        await booking.save({ session });

        result = {
          booking: await this.findOne(bookingId, session),
          serviceOrder,
        };
      });
    } finally {
      await session.endSession();
    }

    if (!result) {
      throw new ConflictException({
        code: ERROR_CODES.VALIDATION_FAILED,
        message: 'Khong the check-in booking, vui long thu lai',
      });
    }

    return result;
  }

  /**
   * Cancel an active booking and store operator/customer audit fields.
   */
  async cancel(
    bookingId: string,
    dto: CancelBookingDto,
    currentUser: AuthenticatedUser,
  ): Promise<BookingResponseDto> {
    const session = await this.connection.startSession();
    let result: BookingResponseDto | undefined;

    try {
      await session.withTransaction(async () => {
        const booking = await this.findBookingDocumentOrThrow(
          bookingId,
          session,
        );
        if (!CANCELLABLE_STATUSES.includes(booking.status)) {
          await this.throwCannotCancelServedIfLinkedServiceOrderServed(
            booking.serviceOrderId,
            session,
          );
          throw this.invalidStatusException();
        }

        await this.cancelLinkedServiceOrderIfAllowed(
          booking.serviceOrderId,
          dto.reason,
          currentUser,
          session,
        );

        booking.status = BookingStatus.CANCELLED;
        booking.cancelledAt = new Date();
        booking.cancelledBy = new Types.ObjectId(currentUser.id);
        booking.cancelReason = dto.reason.trim();
        await booking.save({ session });

        result = await this.findOne(bookingId, session);
      });
    } finally {
      await session.endSession();
    }

    if (!result) {
      throw new ConflictException({
        code: ERROR_CODES.VALIDATION_FAILED,
        message: 'Khong the huy booking, vui long thu lai',
      });
    }

    return result;
  }

  /**
   * Mark a confirmed booking as no-show after the grace period.
   */
  async markNoShow(bookingId: string): Promise<BookingResponseDto> {
    const booking = await this.findBookingDocumentOrThrow(bookingId);
    if (booking.status !== BookingStatus.CONFIRMED) {
      throw this.invalidStatusException();
    }

    const allowedAt = this.addMinutes(booking.scheduledStart, 30);
    if (Date.now() <= allowedAt.getTime()) {
      throw new BadRequestException({
        code: ERROR_CODES.BOOKING_NO_SHOW_TOO_EARLY,
        message: 'Chi co the danh dau no-show sau gio hen 30 phut',
      });
    }

    booking.status = BookingStatus.NO_SHOW;
    await booking.save();

    return this.findOne(bookingId);
  }

  /**
   * Update booking note and limited post-check-in status transitions.
   */
  async update(
    bookingId: string,
    dto: UpdateBookingDto,
  ): Promise<BookingResponseDto> {
    const booking = await this.findBookingDocumentOrThrow(bookingId);
    if (dto.note !== undefined) {
      booking.note = dto.note.trim();
    }

    if (dto.status !== undefined && dto.status !== booking.status) {
      this.applyPatchStatusTransition(booking, dto.status);
    }

    await booking.save();

    return this.findOne(bookingId);
  }

  /**
   * List bookings with filters for operator search screens.
   */
  async findAll(query: QueryBookingDto): Promise<{
    data: BookingResponseDto[];
    meta: BookingPaginationMeta;
  }> {
    const filter: Record<string, unknown> = {};

    if (query.customerId) {
      filter.customerId = new Types.ObjectId(query.customerId);
    }
    if (query.staffId) {
      filter.staffId = new Types.ObjectId(query.staffId);
    }
    if (query.status) {
      filter.status = query.status;
    }
    if (query.search) {
      const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { 'customerSnapshot.fullName': { $regex: escaped, $options: 'i' } },
        { 'customerSnapshot.phone': { $regex: escaped, $options: 'i' } },
      ];
    }

    const scheduledFilter = this.buildDateRangeFilter(
      query.fromDate,
      query.toDate,
    );
    if (scheduledFilter) {
      filter.scheduledStart = scheduledFilter;
    }

    const page = query.page ?? DEFAULT_PAGE;
    const limit = Math.min(query.limit ?? 10, MAX_LIMIT);
    const skip = (page - 1) * limit;
    const sortFieldMap: Record<BookingSortField, string> = {
      scheduledStart: 'scheduledStart',
      createdAt: 'created_at',
    };
    const sortField = sortFieldMap[query.sortBy ?? 'scheduledStart'];
    const sortDirection = query.sortOrder === 'desc' ? -1 : 1;

    const [docs, total] = await Promise.all([
      this.bookingModel
        .find(filter)
        .populate('customerId', 'fullName phone email')
        .populate('serviceId', 'code name unitPrice')
        .sort({ [sortField]: sortDirection })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.bookingModel.countDocuments(filter).exec(),
    ]);

    return {
      data: docs.map((doc) => this.mapToResponse(doc)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find one booking by id and hide OTP code from the response.
   */
  async findOne(
    bookingId: string,
    session?: ClientSession,
  ): Promise<BookingResponseDto> {
    const query = this.bookingModel
      .findById(bookingId)
      .populate('customerId', 'fullName phone email')
      .populate('serviceId', 'code name unitPrice');

    if (session) {
      query.session(session);
    }

    const booking = await query.exec();
    if (!booking) {
      throw this.notFoundException();
    }

    return this.mapToResponse(booking);
  }

  private async prepareBooking(
    serviceId: string,
    scheduledStart: Date,
  ): Promise<{
    service: ServiceResponseDto;
    assignment: AssignmentResponseDto;
  }> {
    this.assertFutureStart(scheduledStart);

    const service = await this.resolveActiveService(serviceId);
    this.assertWithinOpenHours(service, scheduledStart);

    const isAvailable = await this.slotAvailabilityService.isSlotAvailable(
      serviceId,
      scheduledStart,
    );
    if (!isAvailable) {
      throw new ConflictException({
        code: ERROR_CODES.BOOKING_SLOT_UNAVAILABLE,
        message: 'Khung gio nay vua bi dat, vui long chon khung gio khac',
      });
    }

    const assignment = await this.resolveAssignment(serviceId);
    return { service, assignment };
  }

  private async createConfirmedBooking(
    payload: BookingCreatePayload,
  ): Promise<BookingResponseDto> {
    return this.createBooking(payload, BookingStatus.CONFIRMED);
  }

  private async createBooking(
    payload: BookingCreatePayload,
    status: BookingStatus,
  ): Promise<BookingResponseDto> {
    const scheduledEnd = this.addMinutes(
      payload.scheduledStart,
      payload.service.durationMinutes + payload.service.bufferMinutes,
    );
    const staffName = payload.assignment.staff?.fullName ?? '';

    for (let attempt = 1; attempt <= BOOKING_CODE_RETRY_LIMIT; attempt += 1) {
      try {
        const bookingCode = await this.generateBookingCode();
        const created = await this.bookingModel.create({
          bookingCode,
          customerId: new Types.ObjectId(payload.customer.id),
          serviceId: new Types.ObjectId(payload.service.id),
          staffId: new Types.ObjectId(payload.assignment.staffId),
          customerSnapshot: {
            fullName: payload.customer.fullName,
            phone: payload.customer.phone,
            email: payload.customer.email ?? '',
          },
          serviceSnapshot: {
            code: payload.service.code,
            name: payload.service.name,
            price: payload.service.unitPrice,
            durationMinutes: payload.service.durationMinutes,
            cleanupMinutes: payload.service.bufferMinutes,
          },
          staffSnapshot: {
            fullName: staffName,
          },
          scheduledStart: payload.scheduledStart,
          scheduledEnd,
          status,
          source: payload.source,
          otpCode: null,
          otpExpiresAt: null,
          otpAttempts: 0,
          verifiedAt: null,
          note: payload.note?.trim() ?? '',
          serviceOrderId: null,
          createdBy: payload.createdBy
            ? new Types.ObjectId(payload.createdBy)
            : null,
          cancelledAt: null,
          cancelledBy: null,
          cancelReason: null,
        });

        return this.findOne(this.getObjectIdString(created._id));
      } catch (error) {
        if (
          this.isDuplicateKeyError(error) &&
          attempt < BOOKING_CODE_RETRY_LIMIT
        ) {
          continue;
        }

        if (this.isDuplicateKeyError(error)) {
          throw new ConflictException({
            code: ERROR_CODES.VALIDATION_FAILED,
            message: 'Khong the sinh ma booking duy nhat, vui long thu lai',
          });
        }

        throw error;
      }
    }

    throw new ConflictException({
      code: ERROR_CODES.VALIDATION_FAILED,
      message: 'Khong the sinh ma booking duy nhat, vui long thu lai',
    });
  }

  private async resolveActiveCustomer(
    customerId: string,
  ): Promise<CustomerResponseDto> {
    try {
      const customer = await this.customerService.findOne(customerId);
      if (!customer.isActive) {
        throw new BadRequestException({
          code: ERROR_CODES.CUSTOMER_INACTIVE,
          message: 'Khach hang da bi vo hieu hoa',
        });
      }
      return customer;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new BadRequestException({
          code: ERROR_CODES.CUSTOMER_NOT_FOUND,
          message: 'Khach hang khong ton tai',
        });
      }
      throw error;
    }
  }

  private async resolveActiveService(
    serviceId: string,
  ): Promise<ServiceResponseDto> {
    try {
      const service = await this.serviceService.findOne(serviceId);
      if (!service.isActive) {
        throw new BadRequestException({
          code: ERROR_CODES.SERVICE_NOT_FOUND,
          message: 'Dich vu khong ton tai hoac dang inactive',
        });
      }
      return service;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new BadRequestException({
          code: ERROR_CODES.SERVICE_NOT_FOUND,
          message: 'Dich vu khong ton tai hoac dang inactive',
        });
      }
      throw error;
    }
  }

  private async resolveAssignment(
    serviceId: string,
  ): Promise<AssignmentResponseDto> {
    try {
      const assignment = await this.assignmentService.findByService(serviceId);
      if (!assignment.staff) {
        throw this.noStaffException();
      }
      return assignment;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw this.noStaffException();
      }
      throw error;
    }
  }

  private async findBookingDocumentOrThrow(
    bookingId: string,
    session?: ClientSession,
  ): Promise<BookingDocument> {
    const query = this.bookingModel.findById(bookingId);
    if (session) {
      query.session(session);
    }

    const booking = await query.exec();
    if (!booking) {
      throw this.notFoundException();
    }

    return booking;
  }

  private parseDateTime(value: string): Date {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException({
        code: ERROR_CODES.VALIDATION_FAILED,
        message: 'scheduledStart khong hop le',
      });
    }

    return date;
  }

  private assertFutureStart(scheduledStart: Date): void {
    if (scheduledStart.getTime() <= Date.now()) {
      throw new BadRequestException({
        code: ERROR_CODES.BOOKING_PAST_TIME,
        message: 'Khong the dat lich trong qua khu',
      });
    }
  }

  private assertWithinOpenHours(
    service: ServiceResponseDto,
    scheduledStart: Date,
  ): void {
    const openTime = new Date(scheduledStart);
    openTime.setHours(8, 0, 0, 0);
    const closeTime = new Date(scheduledStart);
    closeTime.setHours(22, 0, 0, 0);
    const scheduledEnd = this.addMinutes(
      scheduledStart,
      service.durationMinutes + service.bufferMinutes,
    );
    const minutesFromOpen =
      (scheduledStart.getHours() - 8) * 60 + scheduledStart.getMinutes();
    const isAlignedToStep =
      scheduledStart.getSeconds() === 0 &&
      scheduledStart.getMilliseconds() === 0 &&
      minutesFromOpen % 30 === 0;

    if (
      scheduledStart.getTime() < openTime.getTime() ||
      scheduledStart.getTime() >= closeTime.getTime() ||
      scheduledEnd.getTime() > closeTime.getTime() ||
      !isAlignedToStep
    ) {
      throw new BadRequestException({
        code: ERROR_CODES.BOOKING_OUTSIDE_OPEN_HOURS,
        message: 'Khung gio nam ngoai gio mo cua hoac khong du thoi gian',
      });
    }
  }

  private buildDateRangeFilter(fromDate?: string, toDate?: string) {
    if (!fromDate && !toDate) {
      return undefined;
    }

    const filter: { $gte?: Date; $lte?: Date } = {};
    if (fromDate) {
      filter.$gte = new Date(fromDate);
    }
    if (toDate) {
      const endDate = new Date(toDate);
      if (/^\d{4}-\d{2}-\d{2}$/.test(toDate)) {
        endDate.setHours(23, 59, 59, 999);
      }
      filter.$lte = endDate;
    }

    return filter;
  }

  private applyPatchStatusTransition(
    booking: BookingDocument,
    targetStatus: BookingStatus,
  ): void {
    const allowedTargets = PATCH_STATUS_TRANSITIONS[booking.status] ?? [];
    if (!allowedTargets.includes(targetStatus)) {
      throw this.invalidStatusException();
    }

    booking.status = targetStatus;
  }

  private async cancelLinkedServiceOrderIfAllowed(
    serviceOrderId: Types.ObjectId | null,
    reason: string,
    currentUser: AuthenticatedUser,
    session: ClientSession,
  ): Promise<void> {
    if (!serviceOrderId) {
      return;
    }

    const serviceOrder = await this.serviceOrderModel
      .findById(serviceOrderId)
      .session(session)
      .exec();
    if (!serviceOrder) {
      throw new BadRequestException({
        code: ERROR_CODES.SERVICE_ORDER_NOT_FOUND,
        message: 'Phieu dich vu lien ket khong ton tai',
      });
    }

    if (
      serviceOrder.status === ServiceOrderStatus.COMPLETED ||
      serviceOrder.status === ServiceOrderStatus.INVOICED
    ) {
      throw new BadRequestException({
        code: ERROR_CODES.BOOKING_CANNOT_CANCEL_SERVED,
        message:
          'Phien dich vu da hoan tat hoac da thanh toan, khong the huy lich hen',
      });
    }

    if (serviceOrder.status === ServiceOrderStatus.CANCELLED) {
      return;
    }

    if (
      serviceOrder.status !== ServiceOrderStatus.DRAFT &&
      serviceOrder.status !== ServiceOrderStatus.IN_PROGRESS
    ) {
      throw this.invalidStatusException();
    }

    const trimmedReason = reason.trim();
    serviceOrder.status = ServiceOrderStatus.CANCELLED;
    serviceOrder.cancelledAt = new Date();
    serviceOrder.cancelledBy = new Types.ObjectId(currentUser.id);
    serviceOrder.cancelReason = trimmedReason;
    serviceOrder.note = serviceOrder.note
      ? `${serviceOrder.note}\nHuy tu booking: ${trimmedReason}`
      : `Huy tu booking: ${trimmedReason}`;

    await serviceOrder.save({ session });
  }

  private async throwCannotCancelServedIfLinkedServiceOrderServed(
    serviceOrderId: Types.ObjectId | null,
    session: ClientSession,
  ): Promise<void> {
    if (!serviceOrderId) {
      return;
    }

    const serviceOrder = await this.serviceOrderModel
      .findById(serviceOrderId)
      .session(session)
      .exec();
    if (
      serviceOrder?.status === ServiceOrderStatus.COMPLETED ||
      serviceOrder?.status === ServiceOrderStatus.INVOICED
    ) {
      throw new BadRequestException({
        code: ERROR_CODES.BOOKING_CANNOT_CANCEL_SERVED,
        message:
          'Phien dich vu da hoan tat hoac da thanh toan, khong the huy lich hen',
      });
    }
  }

  private mapToResponse(doc: BookingDocument): BookingResponseDto {
    const customer = this.mapCustomer(doc.customerId);
    const service = this.mapService(doc.serviceId);

    return {
      id: this.getObjectIdString(doc._id),
      bookingCode: doc.bookingCode,
      customerId: this.getObjectIdString(doc.customerId),
      serviceId: this.getObjectIdString(doc.serviceId),
      staffId: this.getObjectIdString(doc.staffId),
      customerSnapshot: {
        fullName: doc.customerSnapshot.fullName,
        phone: doc.customerSnapshot.phone,
        email: doc.customerSnapshot.email ?? '',
      },
      serviceSnapshot: {
        code: doc.serviceSnapshot.code,
        name: doc.serviceSnapshot.name,
        price: doc.serviceSnapshot.price,
        durationMinutes: doc.serviceSnapshot.durationMinutes,
        cleanupMinutes: doc.serviceSnapshot.cleanupMinutes,
      },
      staffSnapshot: {
        fullName: doc.staffSnapshot.fullName,
      },
      scheduledStart: doc.scheduledStart.toISOString(),
      scheduledEnd: doc.scheduledEnd.toISOString(),
      status: doc.status,
      source: doc.source,
      otpExpiresAt: doc.otpExpiresAt?.toISOString() ?? null,
      otpAttempts: doc.otpAttempts,
      verifiedAt: doc.verifiedAt?.toISOString() ?? null,
      note: doc.note ?? '',
      serviceOrderId: this.getNullableObjectIdString(doc.serviceOrderId),
      createdBy: this.getNullableObjectIdString(doc.createdBy),
      cancelledAt: doc.cancelledAt?.toISOString() ?? null,
      cancelledBy: this.getNullableObjectIdString(doc.cancelledBy),
      cancelReason: doc.cancelReason ?? null,
      ...(customer ? { customer } : {}),
      ...(service ? { service } : {}),
      createdAt: doc.created_at?.toISOString() ?? '',
      updatedAt: doc.updated_at?.toISOString() ?? '',
    };
  }

  private mapCustomer(value: unknown) {
    if (!value || value instanceof Types.ObjectId) {
      return undefined;
    }

    const customer = value as {
      _id?: unknown;
      fullName?: unknown;
      phone?: unknown;
      email?: unknown;
    };
    if (
      !customer._id ||
      typeof customer.fullName !== 'string' ||
      typeof customer.phone !== 'string'
    ) {
      return undefined;
    }

    return {
      id: this.getObjectIdString(customer._id),
      fullName: customer.fullName,
      phone: customer.phone,
      email: typeof customer.email === 'string' ? customer.email : '',
    };
  }

  private mapService(value: unknown) {
    if (!value || value instanceof Types.ObjectId) {
      return undefined;
    }

    const service = value as {
      _id?: unknown;
      code?: unknown;
      name?: unknown;
      unitPrice?: unknown;
    };
    if (
      !service._id ||
      typeof service.code !== 'string' ||
      typeof service.name !== 'string' ||
      typeof service.unitPrice !== 'number'
    ) {
      return undefined;
    }

    return {
      id: this.getObjectIdString(service._id),
      code: service.code,
      name: service.name,
      price: service.unitPrice,
    };
  }

  private addMinutes(date: Date, minutes: number): Date {
    return new Date(date.getTime() + minutes * 60 * 1000);
  }

  private getNullableObjectIdString(value: unknown): string | null {
    if (!value) {
      return null;
    }
    return this.getObjectIdString(value);
  }

  private getObjectIdString(value: unknown): string {
    if (value instanceof Types.ObjectId) {
      return value.toString();
    }

    if (typeof value === 'object' && value !== null && '_id' in value) {
      const maybeDoc = value as { _id?: unknown };
      return this.getObjectIdString(maybeDoc._id);
    }

    return String(value);
  }

  private notFoundException(): NotFoundException {
    return new NotFoundException({
      code: ERROR_CODES.BOOKING_NOT_FOUND,
      message: 'Booking khong ton tai',
    });
  }

  private invalidStatusException(): BadRequestException {
    return new BadRequestException({
      code: ERROR_CODES.BOOKING_INVALID_STATUS,
      message: 'Trang thai booking khong hop le cho thao tac nay',
    });
  }

  private noStaffException(): BadRequestException {
    return new BadRequestException({
      code: ERROR_CODES.BOOKING_SERVICE_NO_STAFF,
      message: 'Dich vu chua co chuyen vien active phu trach',
    });
  }

  private isDuplicateKeyError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: number }).code === 11000
    );
  }
}
