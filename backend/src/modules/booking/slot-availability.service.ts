import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ERROR_CODES } from '../../shared/constants/error-codes';
import { ServiceResponseDto } from '../service/dto/service-response.dto';
import { ServiceService } from '../service/service.service';
import { AssignmentResponseDto } from '../staff-service-assignment/dto/assignment-response.dto';
import { StaffServiceAssignmentService } from '../staff-service-assignment/staff-service-assignment.service';
import {
  Booking,
  BookingDocument,
  BookingStatus,
} from './booking.schema';
import { SlotStatus } from './dto/availability-response.dto';

export interface SlotInfo {
  time: string;
  status: SlotStatus;
  bookingId?: string;
}

export interface AvailabilityMetadata {
  date: string;
  serviceId: string;
  serviceName: string;
  staffName: string;
}

interface AvailabilityContext {
  service: ServiceResponseDto;
  assignment: AssignmentResponseDto;
  dayStart: Date;
  dayEnd: Date;
}

const BLOCKING_STATUSES = [
  BookingStatus.PENDING_OTP,
  BookingStatus.CONFIRMED,
  BookingStatus.CHECKED_IN,
  BookingStatus.IN_PROGRESS,
];

@Injectable()
export class SlotAvailabilityService {
  readonly OPEN_HOUR = 8;
  readonly CLOSE_HOUR = 22;
  readonly SLOT_STEP_MINUTES = 30;
  readonly BUFFER_MINUTES = 15;

  constructor(
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    private readonly serviceService: ServiceService,
    private readonly assignmentService: StaffServiceAssignmentService,
  ) {}

  /**
   * Calculate all valid start slots for one service/date using the assigned staff.
   */
  async calculateSlots(serviceId: string, date: string): Promise<SlotInfo[]> {
    const context = await this.resolveContext(serviceId, date);
    return this.calculateSlotsForContext(context);
  }

  /**
   * Return the first available slot labels for the landing page.
   */
  async getSuggestedSlots(
    serviceId: string,
    date: string,
    count = 8,
  ): Promise<string[]> {
    const slots = await this.calculateSlots(serviceId, date);
    return slots
      .filter((slot) => slot.status === 'FREE')
      .slice(0, count)
      .map((slot) => slot.time);
  }

  /**
   * Return the operator grid with both free and busy candidate slots.
   */
  async getFullGrid(serviceId: string, date: string): Promise<SlotInfo[]> {
    return this.calculateSlots(serviceId, date);
  }

  /**
   * Check if a requested ISO datetime maps to a currently free slot.
   */
  async isSlotAvailable(
    serviceId: string,
    scheduledStart: Date,
  ): Promise<boolean> {
    const date = this.formatDateKey(scheduledStart);
    const time = this.formatTime(scheduledStart);
    const slots = await this.calculateSlots(serviceId, date);
    return slots.some((slot) => slot.time === time && slot.status === 'FREE');
  }

  /**
   * Resolve display metadata shared by availability responses.
   */
  async getAvailabilityMetadata(
    serviceId: string,
    date: string,
  ): Promise<AvailabilityMetadata> {
    const context = await this.resolveContext(serviceId, date);
    return {
      date,
      serviceId,
      serviceName: context.service.name,
      staffName: context.assignment.staff?.fullName ?? '',
    };
  }

  private async calculateSlotsForContext(
    context: AvailabilityContext,
  ): Promise<SlotInfo[]> {
    const totalBlockTime =
      context.service.durationMinutes + context.service.bufferMinutes;
    const staffId = context.assignment.staffId;
    const bookings = await this.bookingModel
      .find({
        staffId: new Types.ObjectId(staffId),
        status: { $in: BLOCKING_STATUSES },
        scheduledStart: { $lt: context.dayEnd },
        scheduledEnd: { $gt: context.dayStart },
      })
      .sort({ scheduledStart: 1 })
      .exec();

    const slots: SlotInfo[] = [];
    const closeTime = new Date(context.dayStart);
    closeTime.setHours(this.CLOSE_HOUR, 0, 0, 0);

    for (
      let minutes = this.OPEN_HOUR * 60;
      minutes < this.CLOSE_HOUR * 60;
      minutes += this.SLOT_STEP_MINUTES
    ) {
      const slotStart = new Date(context.dayStart);
      slotStart.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
      const slotEnd = this.addMinutes(slotStart, totalBlockTime);

      if (slotEnd.getTime() > closeTime.getTime()) {
        break;
      }

      const overlappingBooking = bookings.find((booking) =>
        this.overlapsBlockedWindow(slotStart, slotEnd, booking),
      );
      const isPastSlot = slotStart.getTime() <= Date.now();

      slots.push({
        time: this.formatTime(slotStart),
        status: overlappingBooking || isPastSlot ? 'BUSY' : 'FREE',
        ...(overlappingBooking
          ? { bookingId: this.getObjectIdString(overlappingBooking._id) }
          : {}),
      });
    }

    return slots;
  }

  private overlapsBlockedWindow(
    slotStart: Date,
    slotEnd: Date,
    booking: BookingDocument,
  ): boolean {
    const busyStart = this.addMinutes(
      booking.scheduledStart,
      -this.BUFFER_MINUTES,
    );
    const busyEnd = this.addMinutes(booking.scheduledEnd, this.BUFFER_MINUTES);

    return slotEnd.getTime() > busyStart.getTime() &&
      slotStart.getTime() < busyEnd.getTime();
  }

  private async resolveContext(
    serviceId: string,
    date: string,
  ): Promise<AvailabilityContext> {
    const [service, assignment] = await Promise.all([
      this.resolveActiveService(serviceId),
      this.resolveAssignment(serviceId),
    ]);
    const dayStart = this.parseDateOnly(date);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    return { service, assignment, dayStart, dayEnd };
  }

  private async resolveActiveService(
    serviceId: string,
  ): Promise<ServiceResponseDto> {
    const service = await this.serviceService.findOne(serviceId);
    if (!service.isActive) {
      throw new BadRequestException({
        code: ERROR_CODES.SERVICE_NOT_FOUND,
        message: 'Dich vu khong ton tai hoac dang inactive',
      });
    }

    return service;
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

  private parseDateOnly(date: string): Date {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
    if (!match) {
      throw new BadRequestException({
        code: ERROR_CODES.VALIDATION_FAILED,
        message: 'date phai co dinh dang YYYY-MM-DD',
      });
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const result = new Date(year, month - 1, day, 0, 0, 0, 0);
    if (
      result.getFullYear() !== year ||
      result.getMonth() !== month - 1 ||
      result.getDate() !== day
    ) {
      throw new BadRequestException({
        code: ERROR_CODES.VALIDATION_FAILED,
        message: 'date khong hop le',
      });
    }

    return result;
  }

  private formatDateKey(date: Date): string {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-');
  }

  private formatTime(date: Date): string {
    return [
      String(date.getHours()).padStart(2, '0'),
      String(date.getMinutes()).padStart(2, '0'),
    ].join(':');
  }

  private addMinutes(date: Date, minutes: number): Date {
    return new Date(date.getTime() + minutes * 60 * 1000);
  }

  private noStaffException(): BadRequestException {
    return new BadRequestException({
      code: ERROR_CODES.BOOKING_SERVICE_NO_STAFF,
      message: 'Dich vu chua co chuyen vien active phu trach',
    });
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
}
