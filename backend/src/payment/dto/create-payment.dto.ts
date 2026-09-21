import { IsString, MinLength } from 'class-validator';

/**
 * No amount field exists here by design. The payment amount is always
 * derived server-side from the persisted Booking (Batch 4), never accepted
 * from the client.
 */
export class CreatePaymentDto {
  @IsString()
  @MinLength(1)
  bookingReference!: string;
}