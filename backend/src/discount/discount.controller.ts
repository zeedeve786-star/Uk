import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { DiscountService } from './discount.service';
import { CalculateDiscountDto } from './dto/calculate-discount.dto';
import { DiscountResult } from './models/discount-result';

@Controller('discount')
export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

  @Post('calculate')
  @HttpCode(200)
  calculate(@Body() dto: CalculateDiscountDto): Promise<DiscountResult> {
    return this.discountService.calculateDiscount(dto);
  }
}