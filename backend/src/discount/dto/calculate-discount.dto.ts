import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class CalculateDiscountDto {
  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsNumber()
  @IsPositive()
  originalAmount!: number;
}