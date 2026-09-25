import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { VehicleCategoryId } from '../../fare/dto/calculate-fare.dto';

export class CreateDriverProfileDto {
  @IsString()
  @MinLength(1)
  userId!: string;

  @IsOptional()
  @IsEnum(VehicleCategoryId)
  vehicleCategory?: VehicleCategoryId;

  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}