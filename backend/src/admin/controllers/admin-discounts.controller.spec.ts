import { DiscountType, Role } from '@prisma/client';
import { AdminDiscountsController } from './admin-discounts.controller';

describe('AdminDiscountsController', () => {
  it('creates a discount and records an audit entry', async () => {
    const discountService = {
      createDiscount: jest.fn().mockResolvedValue({
        id: 'disc-1',
        code: 'SAVE10',
      }),
      listDiscounts: jest.fn(),
      getDiscountById: jest.fn(),
      updateDiscount: jest.fn(),
    };

    const audit = { record: jest.fn() };

    const controller = new AdminDiscountsController(
      discountService as any,
      audit as any,
    );

    const actor = {
      id: 'admin-1',
      email: 'a@a.com',
      role: Role.ADMIN,
      isMasterAdmin: true,
      adminPermissions: [],
    };

    const result = await controller.create(
      {
        code: 'save10',
        type: DiscountType.PERCENTAGE,
        value: 10,
      } as any,
      actor,
    );

    expect(discountService.createDiscount).toHaveBeenCalled();
    expect(audit.record).toHaveBeenCalledWith(
      'admin-1',
      'CREATE_DISCOUNT',
      'Discount',
      'disc-1',
      expect.any(Object),
    );
    expect(result.code).toBe('SAVE10');
  });
});
