import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DiscountType } from '@prisma/client';
import { DiscountService } from './discount.service';

describe('DiscountService', () => {
  let prisma: { discount: { findUnique: jest.Mock } };
  let service: DiscountService;

  const baseDiscount = (overrides: Partial<any> = {}) => ({
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
    ...overrides,
  });

  beforeEach(() => {
    prisma = {
      discount: {
        findUnique: jest.fn(),
      },
    };

    service = new DiscountService(prisma as any);
  });

  it('calculates a percentage discount', async () => {
    prisma.discount.findUnique.mockResolvedValue(baseDiscount());

    const result = await service.calculateDiscount({
      code: 'save10',
      originalAmount: 100,
    });

    expect(result).toEqual({
      discountCode: 'SAVE10',
      discountType: DiscountType.PERCENTAGE,
      originalAmount: 100,
      discountAmount: 10,
      finalAmount: 90,
      currency: 'GBP',
    });
  });

  it('calculates a fixed discount', async () => {
    prisma.discount.findUnique.mockResolvedValue(
      baseDiscount({
        code: 'SAVE20',
        type: DiscountType.FIXED,
        value: 2000,
      }),
    );

    const result = await service.calculateDiscount({
      code: 'save20',
      originalAmount: 100,
    });

    expect(result.discountAmount).toBe(20);
    expect(result.finalAmount).toBe(80);
  });

  it('rejects an inactive discount', async () => {
    prisma.discount.findUnique.mockResolvedValue(
      baseDiscount({ active: false }),
    );

    await expect(
      service.calculateDiscount({
        code: 'SAVE10',
        originalAmount: 100,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects an expired discount', async () => {
    prisma.discount.findUnique.mockResolvedValue(
      baseDiscount({
        endsAt: new Date(Date.now() - 60_000),
      }),
    );

    await expect(
      service.calculateDiscount({
        code: 'SAVE10',
        originalAmount: 100,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects a discount that is not yet active', async () => {
    prisma.discount.findUnique.mockResolvedValue(
      baseDiscount({
        startsAt: new Date(Date.now() + 60_000),
      }),
    );

    await expect(
      service.calculateDiscount({
        code: 'SAVE10',
        originalAmount: 100,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects a fare below the minimum required amount', async () => {
    prisma.discount.findUnique.mockResolvedValue(
      baseDiscount({
        minimumFarePence: 5000,
      }),
    );

    await expect(
      service.calculateDiscount({
        code: 'SAVE10',
        originalAmount: 40,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('applies a maximum discount cap', async () => {
    prisma.discount.findUnique.mockResolvedValue(
      baseDiscount({
        value: 50,
        maximumDiscountPence: 1000,
      }),
    );

    const result = await service.calculateDiscount({
      code: 'SAVE10',
      originalAmount: 100,
    });

    expect(result.discountAmount).toBe(10);
    expect(result.finalAmount).toBe(90);
  });

  it('never allows the discount to make the final amount negative', async () => {
    prisma.discount.findUnique.mockResolvedValue(
      baseDiscount({
        type: DiscountType.FIXED,
        value: 20000,
      }),
    );

    const result = await service.calculateDiscount({
      code: 'SAVE10',
      originalAmount: 100,
    });

    expect(result.discountAmount).toBe(100);
    expect(result.finalAmount).toBe(0);
  });

  it('rejects an unknown discount code', async () => {
    prisma.discount.findUnique.mockResolvedValue(null);

    await expect(
      service.calculateDiscount({
        code: 'UNKNOWN',
        originalAmount: 100,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('is deterministic for identical inputs', async () => {
    prisma.discount.findUnique.mockResolvedValue(baseDiscount());

    const input = {
      code: 'SAVE10',
      originalAmount: 73.5,
    };

    const first = await service.calculateDiscount(input);
    const second = await service.calculateDiscount(input);

    expect(first).toEqual(second);
  });

  it('ignores any client-supplied totals and calculates from the server-side original amount', async () => {
    prisma.discount.findUnique.mockResolvedValue(baseDiscount());

    const spoofed = {
      code: 'SAVE10',
      originalAmount: 100,
      discountAmount: 1,
      finalAmount: 1,
    } as any;

    const result = await service.calculateDiscount(spoofed);

    expect(result.originalAmount).toBe(100);
    expect(result.discountAmount).toBe(10);
    expect(result.finalAmount).toBe(90);
  });
});
describe('DiscountService admin CRUD (B9)', () => {
  let prisma: { discount: { create: jest.Mock; findMany: jest.Mock; findUnique: jest.Mock; update: jest.Mock } };
  let service: DiscountService;

  beforeEach(() => {
    prisma = { discount: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn() } };
    service = new DiscountService(prisma as any);
  });

  it('creates a discount, normalizing the code to uppercase', async () => {
    prisma.discount.create.mockResolvedValue({ id: 'disc-1', code: 'SAVE10' });
    await service.createDiscount({ code: 'save10', type: DiscountType.PERCENTAGE, value: 10 } as any);
    expect(prisma.discount.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ code: 'SAVE10' }) }),
    );
  });

  it('lists discounts ordered by most recent', async () => {
    prisma.discount.findMany.mockResolvedValue([]);
    await service.listDiscounts();
    expect(prisma.discount.findMany).toHaveBeenCalledWith({ orderBy: { createdAt: 'desc' } });
  });

  it('throws NotFoundException for an unknown discount id', async () => {
    prisma.discount.findUnique.mockResolvedValue(null);
    await expect(service.getDiscountById('missing')).rejects.toThrow(NotFoundException);
  });

  it('updates only the provided fields', async () => {
    prisma.discount.findUnique.mockResolvedValue({ id: 'disc-1', code: 'SAVE10' });
    prisma.discount.update.mockResolvedValue({ id: 'disc-1', active: false });
    await service.updateDiscount('disc-1', { active: false } as any);
    expect(prisma.discount.update).toHaveBeenCalledWith({ where: { id: 'disc-1' }, data: { active: false } });
  });
});