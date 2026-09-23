import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreatePaymentDto } from './create-payment.dto';

describe('CreatePaymentDto validation', () => {
  it('rejects a missing bookingReference', async () => {
    const dto = plainToInstance(CreatePaymentDto, {});
    expect((await validate(dto)).length).toBeGreaterThan(0);
  });

  it('rejects an empty bookingReference', async () => {
    const dto = plainToInstance(CreatePaymentDto, { bookingReference: '' });
    expect((await validate(dto)).length).toBeGreaterThan(0);
  });

  it('accepts a valid bookingReference', async () => {
    const dto = plainToInstance(CreatePaymentDto, { bookingReference: 'BK-TESTREF-0001' });
    expect(await validate(dto)).toHaveLength(0);
  });
});