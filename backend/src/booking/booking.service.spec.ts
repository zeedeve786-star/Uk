import { Prisma } from '@prisma/client';
import { FareService } from '../fare/fare.service';
import { DiscountService } from '../discount/discount.service';
import { BookingService } from './booking.service';
import { VehicleCategoryId } from '../fare/dto/calculate-fare.dto';

describe('BookingService', () => {
  const prisma = {
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
    discount: {
      findUnique: jest.fn(),
    },
    ride: {
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
    },
    driverProfile: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(async (callback: any) => {
      const tx = {
        booking: {
          findUnique: jest.fn().mockResolvedValue({
            vehicleCategory: 'saloon',
          }),
        },
        ride: {
          create: jest.fn().mockResolvedValue({
            id: 'ride-test',
            rideReference: 'RD-TEST123',
            bookingId: 'booking-test',
          }),
        },
        driverProfile: {
          findFirst: jest.fn().mockResolvedValue(null),
          update: jest.fn().mockResolvedValue({}),
        },
      };
      return callback(tx);
    }),
  } as any;

  let service: BookingService;

  beforeEach(() => {
    jest.clearAllMocks();
    const notificationService = {
      notify: jest.fn().mockResolvedValue(undefined),
    } as any;

    service = new BookingService(
      prisma,
      new FareService({
        fareConfiguration: {
          findFirst: jest.fn().mockResolvedValue({
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
}),
          create: jest.fn(),
        },
      } as any),
      new DiscountService(prisma),
      notificationService,
    );
  });

  const baseDto = {
    pickup: 'Heathrow Airport',
    destination: 'Central London',
    journeyDate: '2026-10-10',
    journeyTime: '14:30',
    customerName: 'John Smith',
    customerEmail: 'john@example.com',
    customerPhone: '+447700900123',
    passengerCount: 2,
    vehicleCategory: VehicleCategoryId.SALOON,
    distanceMiles: 20,
  };

  it('creates a booking using the server-calculated fare', async () => {
    prisma.booking.create.mockResolvedValue({
      bookingReference: 'BK-ABC123-TEST',
      pickup: baseDto.pickup,
      destination: baseDto.destination,
      journeyDate: new Date('2026-10-10T00:00:00.000Z'),
      journeyTime: baseDto.journeyTime,
      customerName: baseDto.customerName,
      customerEmail: baseDto.customerEmail,
      customerPhone: baseDto.customerPhone,
      passengerCount: baseDto.passengerCount,
      vehicleCategory: 'saloon',
      originalFarePence: 3500,
      discountCode: null,
      discountAmountPence: 0,
      finalFarePence: 3500,
      currency: 'GBP',
      paymentStatus: 'PENDING',
      bookingStatus: 'PENDING',
      createdAt: new Date('2026-10-01T10:00:00.000Z'),
    });

    const result = await service.createBooking(baseDto);

    expect(result.bookingReference).toBe('BK-ABC123-TEST');
    expect(result.pricing.originalFare).toBe(35);
    expect(result.pricing.finalFare).toBe(35);
    expect(result.pricing.currency).toBe('GBP');

    expect(prisma.booking.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          originalFarePence: 3500,
          finalFarePence: 3500,
          currency: 'GBP',
        }),
      }),
    );
  });

  it('uses a server-generated booking reference', async () => {
    prisma.booking.create.mockResolvedValue({
      bookingReference: 'BK-ABC123-TEST',
      pickup: baseDto.pickup,
      destination: baseDto.destination,
      journeyDate: new Date('2026-10-10T00:00:00.000Z'),
      journeyTime: baseDto.journeyTime,
      customerName: baseDto.customerName,
      customerEmail: baseDto.customerEmail,
      customerPhone: baseDto.customerPhone,
      passengerCount: baseDto.passengerCount,
      vehicleCategory: 'saloon',
      originalFarePence: 3500,
      discountCode: null,
      discountAmountPence: 0,
      finalFarePence: 3500,
      currency: 'GBP',
      paymentStatus: 'PENDING',
      bookingStatus: 'PENDING',
      createdAt: new Date(),
    });

    await service.createBooking(baseDto);

    const call = prisma.booking.create.mock.calls[0][0];

    expect(call.data.bookingReference).toMatch(
      /^BK-[0-9A-Z]+-[0-9A-Z]{4}$/,
    );
  });

  it('retries when the generated booking reference collides', async () => {
    prisma.booking.create
      .mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('Unique constraint', {
          code: 'P2002',
          clientVersion: '5.0.0',
        }),
      )
      .mockResolvedValueOnce({
        bookingReference: 'BK-ABC123-TEST',
        pickup: baseDto.pickup,
        destination: baseDto.destination,
        journeyDate: new Date('2026-10-10T00:00:00.000Z'),
        journeyTime: baseDto.journeyTime,
        customerName: baseDto.customerName,
        customerEmail: baseDto.customerEmail,
        customerPhone: baseDto.customerPhone,
        passengerCount: baseDto.passengerCount,
        vehicleCategory: 'saloon',
        originalFarePence: 3500,
        discountCode: null,
        discountAmountPence: 0,
        finalFarePence: 3500,
        currency: 'GBP',
        paymentStatus: 'PENDING',
        bookingStatus: 'PENDING',
        createdAt: new Date(),
      });

    const result = await service.createBooking(baseDto);

    expect(result.bookingReference).toBe('BK-ABC123-TEST');
    expect(prisma.booking.create).toHaveBeenCalledTimes(2);
  });

  it('ignores client-supplied booking reference and payment fields', async () => {
    prisma.booking.create.mockResolvedValue({
      bookingReference: 'BK-SERVER-TEST',
      pickup: baseDto.pickup,
      destination: baseDto.destination,
      journeyDate: new Date('2026-10-10T00:00:00.000Z'),
      journeyTime: baseDto.journeyTime,
      customerName: baseDto.customerName,
      customerEmail: baseDto.customerEmail,
      customerPhone: baseDto.customerPhone,
      passengerCount: baseDto.passengerCount,
      vehicleCategory: 'saloon',
      originalFarePence: 3500,
      discountCode: null,
      discountAmountPence: 0,
      finalFarePence: 3500,
      currency: 'GBP',
      paymentStatus: 'PENDING',
      bookingStatus: 'PENDING',
      createdAt: new Date(),
    });

    const spoofedDto = {
      ...baseDto,
      bookingReference: 'FAKE-REFERENCE',
      bookingStatus: 'CONFIRMED',
      paymentStatus: 'PAID',
      finalFarePence: 1,
    } as any;

    await service.createBooking(spoofedDto);

    const call = prisma.booking.create.mock.calls[0][0];

    expect(call.data.bookingReference).not.toBe('FAKE-REFERENCE');
    expect(call.data.finalFarePence).toBe(3500);
    expect(call.data.paymentStatus).toBeUndefined();
    expect(call.data.bookingStatus).toBeUndefined();
  });

  it('stores pricing as integer pence', async () => {
    prisma.booking.create.mockResolvedValue({
      bookingReference: 'BK-ABC123-TEST',
      pickup: baseDto.pickup,
      destination: baseDto.destination,
      journeyDate: new Date('2026-10-10T00:00:00.000Z'),
      journeyTime: baseDto.journeyTime,
      customerName: baseDto.customerName,
      customerEmail: baseDto.customerEmail,
      customerPhone: baseDto.customerPhone,
      passengerCount: baseDto.passengerCount,
      vehicleCategory: 'saloon',
      originalFarePence: 3500,
      discountCode: null,
      discountAmountPence: 0,
      finalFarePence: 3500,
      currency: 'GBP',
      paymentStatus: 'PENDING',
      bookingStatus: 'PENDING',
      createdAt: new Date(),
    });

    await service.createBooking(baseDto);

    const call = prisma.booking.create.mock.calls[0][0];

    expect(Number.isInteger(call.data.originalFarePence)).toBe(true);
    expect(Number.isInteger(call.data.finalFarePence)).toBe(true);
  });

  it('normalizes and applies a discount code server-side', async () => {
    prisma.discount.findUnique.mockResolvedValue({
      id: 'discount-1',
      code: 'SAVE10',
      active: true,
      type: 'PERCENTAGE',
      value: 10,
      startsAt: null,
      endsAt: null,
      minimumFarePence: null,
      maximumDiscountPence: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    prisma.booking.create.mockResolvedValue({
      bookingReference: 'BK-ABC123-TEST',
      pickup: baseDto.pickup,
      destination: baseDto.destination,
      journeyDate: new Date('2026-10-10T00:00:00.000Z'),
      journeyTime: baseDto.journeyTime,
      customerName: baseDto.customerName,
      customerEmail: baseDto.customerEmail,
      customerPhone: baseDto.customerPhone,
      passengerCount: baseDto.passengerCount,
      vehicleCategory: 'saloon',
      originalFarePence: 3500,
      discountCode: 'SAVE10',
      discountAmountPence: 350,
      finalFarePence: 3150,
      currency: 'GBP',
      paymentStatus: 'PENDING',
      bookingStatus: 'PENDING',
      createdAt: new Date(),
    });

    const result = await service.createBooking({
      ...baseDto,
      discountCode: ' save10 ',
    });

    expect(prisma.discount.findUnique).toHaveBeenCalledWith({
      where: { code: 'SAVE10' },
    });

    expect(result.pricing.discountCode).toBe('SAVE10');
    expect(result.pricing.discountAmount).toBe(3.5);
    expect(result.pricing.finalFare).toBe(31.5);
  });
});