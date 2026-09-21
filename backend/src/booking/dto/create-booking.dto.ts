import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  Min,
  MinLength,
} from 'class-validator';
import { VehicleCategoryId } from '../../fare/dto/calculate-fare.dto';

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;
const PHONE_PATTERN = /^[0-9+()\s-]{7,}$/;

export class CreateBookingDto {
  @IsString()
  @MinLength(1)
  pickup!: string;

  @IsString()
  @MinLength(1)
  destination!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  extraStops?: string[];

  @IsISO8601({ strict: true })
  journeyDate!: string;

  @Matches(TIME_PATTERN, { message: 'journeyTime must be in HH:mm format' })
  journeyTime!: string;

  @IsString()
  @MinLength(1)
  customerName!: string;

  @IsEmail()
  customerEmail!: string;

  @Matches(PHONE_PATTERN, { message: 'customerPhone must be a valid phone number' })
  customerPhone!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  passengerCount!: number;

  @IsEnum(VehicleCategoryId)
  vehicleCategory!: VehicleCategoryId;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  distanceMiles!: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  discountCode?: string;
}