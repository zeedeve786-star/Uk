import { IsArray, IsBoolean, IsOptional, IsString, IsUrl, MinLength } from 'class-validator';
import { VehicleCategoryId } from '../../fare/dto/calculate-fare.dto';
import { IsEnum } from 'class-validator';

export class CreateVehicleContentDto {
  @IsEnum(VehicleCategoryId)
  vehicleCategory!: VehicleCategoryId;

  @IsString()
  @MinLength(1)
  title!: string;

  @IsString()
  @MinLength(1)
  description!: string;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  imageUrls?: string[];

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  videoUrls?: string[];

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}