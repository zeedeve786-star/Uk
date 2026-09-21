import { BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import { PaymentService } from './payment.service';

function baseBooking(overrides: Partial<any> = {}) {
  return {
    id: 'booking-internal-id', bookingReference: 'BK-TESTREF-0001', finalFarePence: 2300, currency: 'GBP',
    paymentStatus: PaymentStatus.PENDING, bookingStatus: 'PENDING', customerEmail: 'jane@example.com', ...overrides,
  };
}

describe('PaymentService', () => {
  let prisma: {
    booking: { findUnique: jest.Mock; update: jest.Mock };
    paymentTransaction: { create: jest.Mock; findUnique: jest.Mock; update: jest.Mock };
  };
  let stripe: { paymentIntents: { create: jest.Mock } };
  let notificationService: { notify: jest.Mock };
  let service: PaymentService;

  beforeEach(() => {
    prisma = {
      booking: { findUnique: jest.fn(), update: jest.fn() },
      paymentTransaction: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    };
    stripe = { paymentIntents: { create: jest.fn() } };
    notificationService = { notify: jest.fn() };
    service = new PaymentService(prisma as any, stripe as any, notificationService as any);
  });

  describe('createPayment', () => {
    it('creates a valid payment using the server-persisted booking amount', async () => {
      prisma.booking.findUnique.mockResolvedValue(baseBooking());
      stripe.paymentIntents.create.mockResolvedValue({ id: 'pi_123', client_secret: 'pi_123_secret', status: 'requires_payment_method' });
      prisma.paymentTransaction.create.mockResolvedValue({ amountPence: 2300, currency: 'GBP', status: PaymentStatus.PENDING });

      const result = await service.createPayment({ bookingReference: 'BK-TESTREF-0001' });
      expect(result.amount).toBe(23);
    });

    it('does not send a notification merely on PaymentIntent creation (not a real outcome yet)', async () => {
      prisma.booking.findUnique.mockResolvedValue(baseBooking());
      stripe.paymentIntents.create.mockResolvedValue({ id: 'pi_123', client_secret: 'secret', status: 'requires_payment_method' });
      prisma.paymentTransaction.create.mockResolvedValue({ amountPence: 2300, currency: 'GBP', status: PaymentStatus.PENDING });

      await service.createPayment({ bookingReference: 'BK-TESTREF-0001' });
      expect(notificationService.notify).not.toHaveBeenCalled();
    });

    it('rejects payment creation for a booking that does not exist', async () => {
      prisma.booking.findUnique.mockResolvedValue(null);
      await expect(service.createPayment({ bookingReference: 'BK-UNKNOWN' })).rejects.toThrow(NotFoundException);
    });

    it('rejects payment creation for a booking already marked PAID', async () => {
      prisma.booking.findUnique.mockResolvedValue(baseBooking({ paymentStatus: PaymentStatus.PAID }));
      await expect(service.createPayment({ bookingReference: 'BK-TESTREF-0001' })).rejects.toThrow(BadRequestException);
    });

    it('handles a Stripe API failure without persisting a transaction', async () => {
      prisma.booking.findUnique.mockResolvedValue(baseBooking());
      stripe.paymentIntents.create.mockRejectedValue(new Error('stripe down'));
      await expect(service.createPayment({ bookingReference: 'BK-TESTREF-0001' })).rejects.toThrow(InternalServerErrorException);
      expect(prisma.paymentTransaction.create).not.toHaveBeenCalled();
    });
  });

  describe('handleStripeEvent', () => {
    function successEvent(paymentIntentId = 'pi_123') {
      return { type: 'payment_intent.succeeded', data: { object: { id: paymentIntentId, status: 'succeeded' } } } as any;
    }
    function failedEvent(paymentIntentId = 'pi_123') {
      return { type: 'payment_intent.payment_failed', data: { object: { id: paymentIntentId, status: 'requires_payment_method' } } } as any;
    }

    it('marks the transaction and booking as PAID and notifies the customer', async () => {
      prisma.paymentTransaction.findUnique.mockResolvedValue({ id: 'txn_1', bookingId: 'booking-internal-id', status: PaymentStatus.PENDING });
      prisma.booking.update.mockResolvedValue(baseBooking({ paymentStatus: PaymentStatus.PAID }));

      await service.handleStripeEvent(successEvent());

      expect(prisma.booking.update).toHaveBeenCalledWith({
        where: { id: 'booking-internal-id' }, data: { paymentStatus: PaymentStatus.PAID },
      });
      expect(notificationService.notify).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'PAYMENT_SUCCEEDED', recipientContact: 'jane@example.com' }),
      );
    });

    it('marks the transaction and booking as FAILED and notifies the customer', async () => {
      prisma.paymentTransaction.findUnique.mockResolvedValue({ id: 'txn_1', bookingId: 'booking-internal-id', status: PaymentStatus.PENDING });
      prisma.booking.update.mockResolvedValue(baseBooking({ paymentStatus: PaymentStatus.FAILED }));

      await service.handleStripeEvent(failedEvent());

      expect(notificationService.notify).toHaveBeenCalledWith(expect.objectContaining({ type: 'PAYMENT_FAILED' }));
    });

    it('is idempotent for a duplicate event and does not notify twice', async () => {
      prisma.paymentTransaction.findUnique.mockResolvedValue({ id: 'txn_1', bookingId: 'booking-internal-id', status: PaymentStatus.PAID });
      await service.handleStripeEvent(successEvent());
      expect(prisma.booking.update).not.toHaveBeenCalled();
      expect(notificationService.notify).not.toHaveBeenCalled();
    });

    it('ignores events for an unknown payment intent', async () => {
      prisma.paymentTransaction.findUnique.mockResolvedValue(null);
      await service.handleStripeEvent(successEvent('pi_unknown'));
      expect(notificationService.notify).not.toHaveBeenCalled();
    });
  });
});
