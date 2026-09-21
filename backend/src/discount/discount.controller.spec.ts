import { Test } from '@nestjs/testing';
import { DiscountType } from '@prisma/client';
import { DiscountController } from './discount.controller';
import { DiscountService } from './discount.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DiscountController (integration)', () => {
  let controller: DiscountController;
  let prismaMock: {
    discount: {
      findUnique: jest.Mock;
    };
  };

  beforeEach(async () => {
    prismaMock = {
      discount: {
        findUnique: jest.fn(),
      },
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [DiscountController],
      providers: [
        DiscountService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    controller = moduleRef.get(DiscountController);
  });

  it('calculates a valid discount through the real controller and service', async () => {
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

    const result = await controller.calculate({
      code: 'save10',
      originalAmount: 100,
    });

    expect(result.discountCode).toBe('SAVE10');
    expect(result.originalAmount).toBe(100);
    expect(result.discountAmount).toBe(10);
    expect(result.finalAmount).toBe(90);
    expect(result.currency).toBe('GBP');
  });

  it('rejects an unknown discount code', async () => {
    prismaMock.discount.findUnique.mockResolvedValue(null);

    await expect(
      controller.calculate({
        code: 'UNKNOWN',
        originalAmount: 100,
      }),
    ).rejects.toThrow('Invalid discount code');
  });
});