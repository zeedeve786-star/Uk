import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { FareService } from './fare.service';
import { CalculateFareDto } from './dto/calculate-fare.dto';
import { FareResult } from './models/fare-result';

@Controller('fare')
export class FareController {
  constructor(private readonly fareService: FareService) {}

  @Post('calculate')
  @HttpCode(200)
  async calculate(@Body() dto: CalculateFareDto): Promise<FareResult> {
    return this.fareService.calculateFare(dto);
  }
}