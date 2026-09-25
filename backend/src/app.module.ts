import { Module } from '@nestjs/common';
import { ApiManagementModule } from './api-management/api-management.module';

import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './prisma/prisma.module';

import { HealthModule } from './health/health.module';

import { FareModule } from './fare/fare.module';

import { DiscountModule } from './discount/discount.module';

import { BookingModule } from './booking/booking.module';

import { PaymentModule } from './payment/payment.module';

import { AuthModule } from './auth/auth.module';

import { AdminModule } from './admin/admin.module';

import { ContentModule } from './content/content.module';

import { SettingsModule } from './settings/settings.module';

import { MediaModule } from './media/media.module';

import { DriverModule } from './driver/driver.module';
import { RideModule } from './ride/ride.module';
import { AvailabilityModule } from './availability/availability.module';
import { NotificationModule } from './notification/notification.module';
import { DriverPaymentModule } from './driver-payment/driver-payment.module';
import { LocationModule } from './location/location.module';

@Module({
  imports: [
    ApiManagementModule,
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthModule,
    FareModule,
    DiscountModule,
    BookingModule,
    PaymentModule,
    AuthModule,
    AdminModule,
    ContentModule,
    SettingsModule,
    MediaModule,
    DriverModule,
    RideModule,
    AvailabilityModule,
    NotificationModule,
    DriverPaymentModule,
    LocationModule,
  ],
})
export class AppModule {}
