import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AdminPermission } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AdminGuard } from '../admin.guard';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { CurrentAdmin } from '../decorators/current-admin.decorator';
import { AdminRequestUser } from '../models/admin-request-user';
import { AdminAuditService } from '../admin-audit.service';
import { BookingService } from '../../booking/booking.service';
import { UpdateBookingStatusDto } from '../../booking/dto/update-booking-status.dto';

@Controller('admin/bookings')
@UseGuards(JwtAuthGuard, AdminGuard)
@RequirePermission(AdminPermission.MANAGE_BOOKINGS)
export class AdminBookingsController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly auditService: AdminAuditService,
  ) {}

  @Get()
  list() {
    return this.bookingService.listBookings();
  }

  @Get(':reference')
  getOne(@Param('reference') reference: string) {
    return this.bookingService.getBookingByReference(reference);
  }

  @Patch(':reference/status')
  async updateStatus(
    @Param('reference') reference: string,
    @Body() dto: UpdateBookingStatusDto,
    @CurrentAdmin() actor: AdminRequestUser,
  ) {
    const booking = await this.bookingService.updateBookingStatus(
      reference,
      dto.bookingStatus,
    );

    await this.auditService.record(
      actor.id,
      'UPDATE_BOOKING_STATUS',
      'Booking',
      booking.bookingReference,
      {
        bookingStatus: dto.bookingStatus,
      },
    );

    return booking;
  }
}
