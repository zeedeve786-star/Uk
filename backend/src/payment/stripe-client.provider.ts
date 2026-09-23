import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

export const STRIPE_CLIENT = 'STRIPE_CLIENT';

export const stripeClientProvider = {
  provide: STRIPE_CLIENT,
  useFactory: (configService: ConfigService): Stripe => {
    const secretKey = configService.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    return new Stripe(secretKey, { apiVersion: '2024-06-20' });
  },
  inject: [ConfigService],
};