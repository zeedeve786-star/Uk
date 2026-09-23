import { Module } from '@nestjs/common';

import { FareModule } from '../fare/fare.module';
import { DiscountModule } from '../discount/discount.module';
import { BookingModule } from '../booking/booking.module';
import { ContentModule } from '../content/content.module';
import { SettingsModule } from '../settings/settings.module';
import { MediaModule } from '../media/media.module';

import { AdminGuard } from './admin.guard';
import { AdminAuditService } from './admin-audit.service';

import { AdminUsersController } from './controllers/admin-users.controller';
import { AdminBookingsController } from './controllers/admin-bookings.controller';
import { AdminDiscountsController } from './controllers/admin-discounts.controller';
import { AdminFareController } from './controllers/admin-fare.controller';
import { AdminAuditController } from './controllers/admin-audit.controller';
import { AdminBlogController } from './controllers/admin-blog.controller';
import { AdminServiceContentController } from './controllers/admin-service-content.controller';
import { AdminVehicleContentController } from './controllers/admin-vehicle-content.controller';
import { AdminSettingsController } from './controllers/admin-settings.controller';
import { AdminMediaController } from './controllers/admin-media.controller';
import { DriverModule } from '../driver/driver.module';
import { AdminDriversController } from './controllers/admin-drivers.controller';
import { AdminAvailabilityController } from './controllers/admin-availability.controller';
import { RideModule } from '../ride/ride.module';
import { AvailabilityModule } from '../availability/availability.module';
import { AdminRidesController } from './controllers/admin-rides.controller';
import { NotificationModule } from '../notification/notification.module';
import { AdminNotificationsController } from './controllers/admin-notifications.controller';
import { DriverPaymentModule } from '../driver-payment/driver-payment.module';
import { AdminDriverPaymentsController } from './controllers/admin-driver-payments.controller';
@Module({
  imports: [
    AvailabilityModule,
    FareModule,
    DiscountModule,
    BookingModule,
    ContentModule,
    SettingsModule,
    MediaModule,
    DriverModule,
    RideModule,
    NotificationModule,
    DriverPaymentModule,
  ],
  controllers: [
    AdminAvailabilityController,
    AdminUsersController,
    AdminBookingsController,
    AdminDiscountsController,
    AdminFareController,
    AdminAuditController,
    AdminBlogController,
    AdminServiceContentController,
    AdminVehicleContentController,
    AdminSettingsController,
    AdminMediaController,
    AdminDriversController,
    AdminRidesController,
    AdminNotificationsController,
    AdminDriverPaymentsController,
  ],
  providers: [AdminGuard, AdminAuditService],
})
export class AdminModule {}