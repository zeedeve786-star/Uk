import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let prisma: { user: { findUnique: jest.Mock; create: jest.Mock } };
  let jwtService: { sign: jest.Mock };
  let service: AuthService;

  beforeEach(() => {
    prisma = { user: { findUnique: jest.fn(), create: jest.fn() } };
    jwtService = { sign: jest.fn().mockReturnValue('signed.jwt.token') };
    service = new AuthService(prisma as any, jwtService as any);
  });

  describe('register', () => {
    it('registers a new user as CUSTOMER regardless of a client-supplied role', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockImplementation(({ data }: any) =>
        Promise.resolve({ id: 'user-1', email: data.email, role: data.role, passwordHash: data.passwordHash }),
      );

      const spoofed = { email: 'jane@example.com', password: 'password123', role: Role.ADMIN } as any;
      const result = await service.register(spoofed);

      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ role: Role.CUSTOMER }) }),
      );
      expect(result.user.role).toBe(Role.CUSTOMER);
      expect(result.accessToken).toBe('signed.jwt.token');
    });

    it('hashes the password before persisting, never storing it in plain text', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockImplementation(({ data }: any) =>
        Promise.resolve({ id: 'user-1', email: data.email, role: data.role, passwordHash: data.passwordHash }),
      );

      await service.register({ email: 'jane@example.com', password: 'password123' });

      const createArg = prisma.user.create.mock.calls[0][0].data;
      expect(createArg.passwordHash).not.toBe('password123');
      expect(await bcrypt.compare('password123', createArg.passwordHash)).toBe(true);
    });

    it('rejects registration for an email that already exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'existing', email: 'jane@example.com' });
      await expect(service.register({ email: 'jane@example.com', password: 'password123' })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    it('logs in with correct credentials and returns a signed token', async () => {
      const passwordHash = await bcrypt.hash('password123', 10);
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'jane@example.com',
        role: Role.CUSTOMER,
        passwordHash,
      });

      const result = await service.login({ email: 'jane@example.com', password: 'password123' });

      expect(result.accessToken).toBe('signed.jwt.token');
      expect(result.user.role).toBe(Role.CUSTOMER);
    });

    it('rejects login for a non-existent email', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.login({ email: 'nobody@example.com', password: 'password123' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('rejects login with an incorrect password', async () => {
      const passwordHash = await bcrypt.hash('correct-password', 10);
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'jane@example.com',
        role: Role.CUSTOMER,
        passwordHash,
      });

      await expect(service.login({ email: 'jane@example.com', password: 'wrong-password' })).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});