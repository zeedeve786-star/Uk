import { RegisterDto } from './register.dto';
import { Role } from '@prisma/client';

describe('RegisterDto', () => {
  it('accepts a valid registration payload', () => {
    const dto = new RegisterDto();
    dto.email = 'jane@example.com';
    dto.password = 'password123';
    dto.role = Role.CUSTOMER;

    expect(dto.email).toBe('jane@example.com');
    expect(dto.password).toBe('password123');
    expect(dto.role).toBe(Role.CUSTOMER);
  });

  it('rejects an invalid email', async () => {
    const dto = new RegisterDto();
    dto.email = 'not-an-email';
    dto.password = 'password123';

    const { validate } = await import('class-validator');
    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'email')).toBe(true);
  });

  it('rejects a password shorter than 8 characters', async () => {
    const dto = new RegisterDto();
    dto.email = 'jane@example.com';
    dto.password = 'short';

    const { validate } = await import('class-validator');
    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'password')).toBe(true);
  });

  it('rejects an invalid role', async () => {
    const dto = new RegisterDto();
    dto.email = 'jane@example.com';
    dto.password = 'password123';
    dto.role = 'INVALID' as Role;

    const { validate } = await import('class-validator');
    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'role')).toBe(true);
  });
});