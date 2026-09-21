import { Test } from '@nestjs/testing';
import { DiscountType } from '@prisma/client';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { FareService } from '../fare/fare.service';
import { DiscountService } from '../discount/discount.service';
import { NotificationService } from '../notification/notification.service';
import { PrismaService } from '../prisma/prisma.service';
import { VehicleCategoryId } from '../fare/dto/calculate-fare.dto';

describe('BookingController (integration)', () => {
  let controller: BookingController;
  let prismaMock: any;

  const fareConfiguration = {
    currency: 'GBP',
    baseFarePence: 500,
    perMilePence: 150,
    perExtraStopPence: 300,
    minimumFarePence: 800,
    saloonMultiplier: 1,
    estateMultiplier: 1.1,
    mpvMultiplier: 1.3,
    executiveMultiplier: 1.6,
    eightSeaterMultiplier: 1.8,
    driverEarningRuleType: 'NONE',
    driverEarningValue: null,
    companyChargePence: null,
    companyChargePercentage: null,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prismaMock = {
      discount: { findUnique: jest.fn() },
      booking: {
        create: jest.fn(),
        findUnique: jest.fn().mockResolvedValue({
          id: 'booking-test',
          vehicleCategory: 'saloon',
          finalFarePence: 3500,
          bookingReference: 'BK-TEST',
          customerEmail: 'test@example.com',
          customerPhone: '07123456789',
          customerName: 'Test Customer',
          pickup: 'Pickup',
          destination: 'Destination',
          extraStops: [],
          journeyDate: new Date('2030-01-01T00:00:00.000Z'),
          journeyTime: '10:00',
          passengerCount: 1,
          currency: 'GBP',
          paymentStatus: 'PENDING',
          bookingStatus: 'CONFIRMED',
        }),
      },
      ride: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({
          id: 'ride-test',
          rideReference: 'RD-TEST123',
          bookingId: 'booking-test',
          status: 'SCHEDULED',
          driverId: null,
          driverEarningPence: null,
          driverEarningSource: null,
          driverEarningLocked: false,
        }),
      },
      notification: { create: jest.fn() },
      fareConfiguration: {
        findFirst: jest.fn().mockResolvedValue(fareConfiguration),
        create: jest.fn(),
      },
      driverProfile: {
        findFirst: jest.fn().mockResolvedValue(null),
        update: jest.fn().mockResolvedValue({}),
      },
      $transaction: jest.fn(async (callback: any) => {
        const tx = {
          ride: {
            create: jest.fn().mockResolvedValue({
              id: 'ride-test',
              rideReference: 'RD-TEST123',
              bookingId: 'booking-test',
              status: 'SCHEDULED',
              driverId: null,
              driverEarningPence: null,
              driverEarningSource: null,
              driverEarningLocked: false,
            }),
          },
          driverProfile: {
            update: jest.fn().mockResolvedValue({}),
          },
        };

        return callback(tx);
      }),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [BookingController],
      providers: [
        BookingService,
        FareService,
        DiscountService,
        NotificationService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    controller = moduleRef.get(BookingController);
  });

  it('creates a booking end-to-end through the real Fare and Discount engines', async () => {
    prismaMock.discount.findUnique.mockResolvedValue({
      id: 'disc_1',
      code: 'SAVE10',
      active: true,
      type: DiscountType.PERCENTAGE,
      value: 10,
      startsAt: null,
      endsAt: null,
      minimumFarePence: null,
      maximumDiscountPence: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    prismaMock.booking.create.mockImplementation(({ data }: any) =>
      Promise.resolve({
        ...data,
        id: 'internal-id',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      }),
    );

    prismaMock.notification.create.mockResolvedValue({});

    const result = await controller.create({
      pickup: 'Manchester Airport',
      destination: 'Manchester City Centre',
      journeyDate: '2026-10-01',
      journeyTime: '14:30',
      customerName: 'Jane Doe',
      customerEmail: 'jane@example.com',
      customerPhone: '+44 7000 000000',
      passengerCount: 2,
      vehicleCategory: VehicleCategoryId.SALOON,
      distanceMiles: 12,
      discountCode: 'save10',
    } as any);

    expect(result.bookingReference).toMatch(/^BK-[0-9A-Z]+-[0-9A-Z]{4}$/);
    expect(result.pricing.discountCode).toBe('SAVE10');
    expect(prismaMock.notification.create).toHaveBeenCalled();
  });
});
