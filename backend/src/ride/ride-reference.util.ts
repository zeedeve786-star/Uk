import { randomBytes } from 'crypto';

export function generateRideReference(): string {
  return `RD-${randomBytes(6).toString('hex').toUpperCase()}`;
}
