import { RideStatus } from '@prisma/client';
import { isTransitionAllowed } from './ride-status.rules';

describe('isTransitionAllowed', () => {
  it('allows SCHEDULED -> IN_PROGRESS', () => {
    expect(isTransitionAllowed(RideStatus.SCHEDULED, RideStatus.IN_PROGRESS)).toBe(true);
  });
  it('allows SCHEDULED -> CANCELLED', () => {
    expect(isTransitionAllowed(RideStatus.SCHEDULED, RideStatus.CANCELLED)).toBe(true);
  });
  it('allows IN_PROGRESS -> COMPLETED', () => {
    expect(isTransitionAllowed(RideStatus.IN_PROGRESS, RideStatus.COMPLETED)).toBe(true);
  });
  it('allows IN_PROGRESS -> CANCELLED', () => {
    expect(isTransitionAllowed(RideStatus.IN_PROGRESS, RideStatus.CANCELLED)).toBe(true);
  });
  it('rejects SCHEDULED -> COMPLETED (skipping IN_PROGRESS)', () => {
    expect(isTransitionAllowed(RideStatus.SCHEDULED, RideStatus.COMPLETED)).toBe(false);
  });
  it('rejects any transition out of COMPLETED', () => {
    expect(isTransitionAllowed(RideStatus.COMPLETED, RideStatus.SCHEDULED)).toBe(false);
    expect(isTransitionAllowed(RideStatus.COMPLETED, RideStatus.IN_PROGRESS)).toBe(false);
  });
  it('rejects any transition out of CANCELLED', () => {
    expect(isTransitionAllowed(RideStatus.CANCELLED, RideStatus.SCHEDULED)).toBe(false);
  });
  it('rejects a same-status transition', () => {
    expect(isTransitionAllowed(RideStatus.SCHEDULED, RideStatus.SCHEDULED)).toBe(false);
  });
});