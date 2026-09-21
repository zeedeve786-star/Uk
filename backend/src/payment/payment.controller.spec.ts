import { Test } from '@nestjs/testing';
import { PaymentStatus } from '@prisma/client';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PrismaService } from '../prisma/prisma.service';
import { STRIPE_CLIENT } from './stripe-client.provider';
import { NotificationService } from '../notification/notification.service';

describe('PaymentController (integration)', () => {
  let controller: PaymentController;
  let prismaMock: any;
  let stripeMock: any;

  beforeEach(async () => {
    prismaMock = {
      booking: { findUnique: jest.fn() },
      paymentTransaction: { create: jest.fn() },
    };
    stripeMock = { paymentIntents: { create: jest.fn() } };

    const moduleRef = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        PaymentService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: STRIPE_CLIENT, useValue: stripeMock },
        { provide: NotificationService, useValue: { notify: jest.fn() } },
      ],
    }).compile();

    controller = moduleRef.get(PaymentController);
  });

  it('creates a payment intent for a payable booking', async () => {
    prismaMock.booking.findUnique.mockResolvedValue({
      id: 'booking-1', bookingReference: 'BK-TESTREF-0001', finalFarePence: 2300, currency: 'GBP',
      paymentStatus: PaymentStatus.PENDING, bookingStatus: 'PENDING',
    });
    stripeMock.paymentIntents.create.mockResolvedValue({ id: 'pi_123', client_secret: 'secret', status: 'requires_payment_method' });
    prismaMock.paymentTransaction.create.mockResolvedValue({ amountPence: 2300, currency: 'GBP', status: PaymentStatus.PENDING });

    const result = await controller.create({ bookingReference: 'BK-TESTREF-0001' });
    expect(result.clientSecret).toBe('secret');
  });
});
