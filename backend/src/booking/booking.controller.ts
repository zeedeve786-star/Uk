import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingResult } from './models/booking-result';

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @HttpCode(201)
  create(@Body() dto: CreateBookingDto): Promise<BookingResult> {
    return this.bookingService.createBooking(dto);
  }
}