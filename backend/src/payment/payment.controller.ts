import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentResult } from './models/payment-result';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @HttpCode(201)
  create(@Body() dto: CreatePaymentDto): Promise<PaymentResult> {
    return this.paymentService.createPayment(dto);
  }
}