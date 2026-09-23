/**
 * Server-side booking reference generator.
 *
 * Not the database ID — a separate, human-readable, customer-facing
 * identifier suitable for confirmation messages. Uniqueness is enforced at
 * the database level (unique constraint); BookingService retries generation
 * on the rare collision rather than trusting this alone.
 */

let lastTimestamp = 0;
let sequence = 0;

export function generateBookingReference(): string {
  const timestamp = Date.now();

  if (timestamp === lastTimestamp) {
    sequence += 1;
  } else {
    lastTimestamp = timestamp;
    sequence = 0;
  }

  const timestampPart = timestamp.toString(36).toUpperCase();
  const sequencePart = sequence.toString(36).padStart(4, '0').toUpperCase();

  return `BK-${timestampPart}-${sequencePart}`;
}