import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { getDatabaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { MustChangePasswordGuard } from './modules/auth/guards/must-change-password.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';
import { HealthModule } from './modules/health/health.module';
import { ServiceModule } from './modules/service/service.module';
import { MaterialModule } from './modules/material/material.module';
import { ServiceMaterialBomModule } from './modules/service-material-bom/service-material-bom.module';
import { SupplierModule } from './modules/supplier/supplier.module';
import { StaffServiceAssignmentModule } from './modules/staff-service-assignment/staff-service-assignment.module';
import { CustomerModule } from './modules/customer/customer.module';
import { StockLedgerModule } from './modules/stock-ledger/stock-ledger.module';

/**
 * Root module của backend.
 * Tải biến môi trường global và cấu hình kết nối MongoDB.
 */
// app.module.ts
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // không cần import ConfigModule ở từng module con
      envFilePath: '.env',
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    AuthModule,
    HealthModule,
    ServiceModule,
    SupplierModule,
    MaterialModule,
    ServiceMaterialBomModule,
    StaffServiceAssignmentModule,
    CustomerModule,
    StockLedgerModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: MustChangePasswordGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
