import { IsArray, IsBoolean, IsOptional, IsString, IsUrl } from 'class-validator';

// vehicleCategory is intentionally excluded — it is the unique key and is
// not editable after creation.
export class UpdateVehicleContentDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsArray() @IsUrl({}, { each: true }) imageUrls?: string[];
  @IsOptional() @IsArray() @IsUrl({}, { each: true }) videoUrls?: string[];
  @IsOptional() @IsBoolean() active?: boolean;
}