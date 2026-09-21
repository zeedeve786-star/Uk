import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentWebhookController } from './payment-webhook.controller';
import { PaymentService } from './payment.service';
import { stripeClientProvider } from './stripe-client.provider';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [PaymentController, PaymentWebhookController],
  providers: [PaymentService, stripeClientProvider],
})
export class PaymentModule {}
