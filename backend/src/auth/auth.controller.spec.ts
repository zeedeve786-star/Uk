import { Test } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthController (integration)', () => {
  let controller: AuthController;
  let prismaMock: { user: { findUnique: jest.Mock; create: jest.Mock } };

  beforeEach(async () => {
    prismaMock = { user: { findUnique: jest.fn(), create: jest.fn() } };

    const moduleRef = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: 'test-secret', signOptions: { expiresIn: '1h' } })],
      controllers: [AuthController],
      providers: [AuthService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();

    controller = moduleRef.get(AuthController);
  });

  it('registers a user end-to-end and returns a signed access token', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockImplementation(({ data }: any) =>
      Promise.resolve({ id: 'user-1', email: data.email, role: data.role }),
    );

    const result = await controller.register({ email: 'jane@example.com', password: 'password123' });

    expect(result.user.role).toBe(Role.CUSTOMER);
    expect(typeof result.accessToken).toBe('string');
    expect(result.accessToken.length).toBeGreaterThan(0);
  });

  it('exposes the authenticated user via the /auth/me handler for a decoded request user', () => {
    const authenticatedUser = { id: 'user-1', email: 'jane@example.com', role: Role.CUSTOMER };
    expect(controller.me(authenticatedUser)).toEqual(authenticatedUser);
  });
});