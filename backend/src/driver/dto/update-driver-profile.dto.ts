import { IsEnum, IsOptional, IsString } from 'class-validator';
import { VehicleCategoryId } from '../../fare/dto/calculate-fare.dto';

export class UpdateDriverProfileDto {
  @IsOptional() @IsEnum(VehicleCategoryId) vehicleCategory?: VehicleCategoryId;
  @IsOptional() @IsString() phone?: string;
}
