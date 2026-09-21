import { RideStatus } from '@prisma/client';

export function isTransitionAllowed(
  current: RideStatus,
  next: RideStatus,
): boolean {
  if (current === RideStatus.COMPLETED || current === RideStatus.CANCELLED) {
    return false;
  }

  if (current === RideStatus.SCHEDULED) {
    return (
      next === RideStatus.IN_PROGRESS ||
      next === RideStatus.CANCELLED
    );
  }

  if (current === RideStatus.IN_PROGRESS) {
    return (
      next === RideStatus.COMPLETED ||
      next === RideStatus.CANCELLED
    );
  }

  return false;
}
