import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import Stripe from 'stripe';
import { NotificationRecipientType, NotificationType, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { STRIPE_CLIENT } from './stripe-client.provider';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentResult } from './models/payment-result';
import { NotificationService } from '../notification/notification.service';

function toPounds(pence: number): number {
  return Math.round(pence) / 100;
}

@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(STRIPE_CLIENT) private readonly stripe: Stripe,
    private readonly notificationService: NotificationService,
  ) {}

  async createPayment(dto: CreatePaymentDto): Promise<PaymentResult> {
    const booking = await this.prisma.booking.findUnique({ where: { bookingReference: dto.bookingReference } });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    if (booking.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Booking has already been paid');
    }
    if (booking.bookingStatus === 'CANCELLED') {
      throw new BadRequestException('Booking is cancelled and cannot be paid');
    }

    const amountPence = booking.finalFarePence;

    let paymentIntent: Stripe.PaymentIntent;
    try {
      paymentIntent = await this.stripe.paymentIntents.create({
        amount: amountPence,
        currency: booking.currency.toLowerCase(),
        metadata: { bookingId: booking.id, bookingReference: booking.bookingReference },
      });
    } catch {
      throw new InternalServerErrorException('Unable to create payment with Stripe');
    }

    if (!paymentIntent.client_secret) {
      throw new InternalServerErrorException('Stripe did not return a client secret');
    }

    const transaction = await this.prisma.paymentTransaction.create({
      data: {
        bookingId: booking.id,
        stripePaymentIntentId: paymentIntent.id,
        amountPence,
        currency: booking.currency,
        status: PaymentStatus.PENDING,
        stripeStatus: paymentIntent.status,
      },
    });

    return {
      bookingReference: booking.bookingReference,
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      amount: toPounds(transaction.amountPence),
      currency: 'GBP',
      status: transaction.status,
    };
  }

  async handleStripeEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.applyPaymentOutcome(event, PaymentStatus.PAID);
        break;
      case 'payment_intent.payment_failed':
      case 'payment_intent.canceled':
        await this.applyPaymentOutcome(event, PaymentStatus.FAILED);
        break;
      default:
        return;
    }
  }

  private async applyPaymentOutcome(event: Stripe.Event, status: PaymentStatus): Promise<void> {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    const transaction = await this.prisma.paymentTransaction.findUnique({
      where: { stripePaymentIntentId: paymentIntent.id },
    });
    if (!transaction) {
      return;
    }
    if (transaction.status === status) {
      return;
    }

    await this.prisma.paymentTransaction.update({
      where: { id: transaction.id },
      data: { status, stripeStatus: paymentIntent.status },
    });
    const updatedBooking = await this.prisma.booking.update({
      where: { id: transaction.bookingId },
      data: { paymentStatus: status },
    });

    await this.notificationService.notify({
      type: status === PaymentStatus.PAID ? NotificationType.PAYMENT_SUCCEEDED : NotificationType.PAYMENT_FAILED,
      recipientType: NotificationRecipientType.CUSTOMER,
      recipientContact: updatedBooking.customerEmail,
      referenceType: 'Booking',
      referenceId: updatedBooking.bookingReference,
      message:
        status === PaymentStatus.PAID
          ? `Payment received for booking ${updatedBooking.bookingReference}.`
          : `Payment failed for booking ${updatedBooking.bookingReference}.`,
    });
  }
}
