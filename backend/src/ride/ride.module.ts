import { Module } from '@nestjs/common';
import { RideService } from './ride.service';
import { NotificationModule } from '../notification/notification.module';
import { FareModule } from '../fare/fare.module';

@Module({
  imports: [NotificationModule, FareModule],
  providers: [RideService],
  exports: [RideService],
})
export class RideModule {}
