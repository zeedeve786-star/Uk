import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CalculateDiscountDto } from './calculate-discount.dto';

describe('CalculateDiscountDto validation', () => {
  it('rejects an empty code', async () => {
    const dto = plainToInstance(CalculateDiscountDto, {
      code: '',
      originalAmount: 20,
    });

    expect((await validate(dto)).length).toBeGreaterThan(0);
  });

  it('rejects a missing code', async () => {
    const dto = plainToInstance(CalculateDiscountDto, {
      originalAmount: 20,
    });

    expect((await validate(dto)).length).toBeGreaterThan(0);
  });

  it('rejects zero amount', async () => {
    const dto = plainToInstance(CalculateDiscountDto, {
      code: 'SAVE10',
      originalAmount: 0,
    });

    expect((await validate(dto)).length).toBeGreaterThan(0);
  });

  it('rejects a negative amount', async () => {
    const dto = plainToInstance(CalculateDiscountDto, {
      code: 'SAVE10',
      originalAmount: -10,
    });

    expect((await validate(dto)).length).toBeGreaterThan(0);
  });

  it('rejects a non-numeric amount', async () => {
    const dto = plainToInstance(CalculateDiscountDto, {
      code: 'SAVE10',
      originalAmount: 'twenty',
    });

    expect((await validate(dto)).length).toBeGreaterThan(0);
  });

  it('accepts a valid payload', async () => {
    const dto = plainToInstance(CalculateDiscountDto, {
      code: 'SAVE10',
      originalAmount: 20,
    });

    expect(await validate(dto)).toHaveLength(0);
  });
});