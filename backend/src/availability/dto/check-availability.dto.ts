import { IsDateString, IsString } from 'class-validator';

export class CheckAvailabilityDto {
  @IsString()
  vehicleCategory!: string;

  @IsDateString()
  date!: string;

  @IsString()
  time!: string;
}
