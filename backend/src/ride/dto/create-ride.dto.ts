import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateRideDto {
  @IsString()
  @MinLength(1)
  bookingReference!: string;

  @IsOptional()
  @IsString()
  operationalNotes?: string;
}
