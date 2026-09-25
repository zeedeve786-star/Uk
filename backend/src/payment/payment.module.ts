import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentWebhookController } from './payment-webhook.controller';
import { PaymentService } from './payment.service';
import { stripeClientProvider } from './stripe-client.provider';
import { NotificationModule } from '../notification/notification.module';
import { RideModule } from '../ride/ride.module';

@Module({
  imports: [NotificationModule, RideModule],
  controllers: [PaymentController, PaymentWebhookController],
  providers: [PaymentService, stripeClientProvider],
})
export class PaymentModule {}
