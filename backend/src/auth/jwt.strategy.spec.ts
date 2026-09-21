import { UnauthorizedException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  function makeStrategy() {
    const configService = { get: jest.fn().mockReturnValue('test-secret') } as any;
    return new JwtStrategy(configService);
  }

  it('returns the authenticated user for a valid payload', () => {
    const strategy = makeStrategy();
    const result = strategy.validate({ sub: 'user-1', email: 'jane@example.com', role: Role.CUSTOMER });
    expect(result).toEqual({ id: 'user-1', email: 'jane@example.com', role: Role.CUSTOMER });
  });

  it('rejects a payload missing required fields', () => {
    const strategy = makeStrategy();
    expect(() => strategy.validate({ sub: '', email: '', role: undefined as any })).toThrow(UnauthorizedException);
  });
});