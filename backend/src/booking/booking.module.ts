import { Module } from '@nestjs/common';

import { BookingController } from './booking.controller';

import { BookingService } from './booking.service';

import { FareModule } from '../fare/fare.module';

import { DiscountModule } from '../discount/discount.module';

import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [FareModule, DiscountModule, NotificationModule],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}
