import { Module } from '@nestjs/common';
import { DriverPaymentService } from './driver-payment.service';

@Module({
  providers: [DriverPaymentService],
  exports: [DriverPaymentService],
})
export class DriverPaymentModule {}
