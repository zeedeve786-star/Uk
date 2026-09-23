import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateAvailabilityBlockDto {
  @IsString()
  vehicleCategory!: string;

  @IsDateString()
  startsAt!: string;

  @IsDateString()
  endsAt!: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
