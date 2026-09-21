import { IsBoolean, IsDateString, IsEnum, IsInt, IsOptional, IsPositive, IsString, Min, MinLength } from 'class-validator';
import { DiscountType } from '@prisma/client';

export class AdminUpdateDiscountDto {
  @IsOptional() @IsString() @MinLength(1) code?: string;
  @IsOptional() @IsBoolean() active?: boolean;
  @IsOptional() @IsEnum(DiscountType) type?: DiscountType;
  @IsOptional() @IsInt() @Min(1) value?: number;
  @IsOptional() @IsDateString() startsAt?: string;
  @IsOptional() @IsDateString() endsAt?: string;
  @IsOptional() @IsInt() @IsPositive() minimumFarePence?: number;
  @IsOptional() @IsInt() @IsPositive() maximumDiscountPence?: number;
}
