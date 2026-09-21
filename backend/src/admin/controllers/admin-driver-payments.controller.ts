import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AdminPermission } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AdminGuard } from '../admin.guard';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { AdminAuditService } from '../admin-audit.service';
import { DriverPaymentService } from '../../driver-payment/driver-payment.service';
import { CreateDriverPaymentDto } from '../../driver-payment/dto/create-driver-payment.dto';

@Controller()
@UseGuards(JwtAuthGuard, AdminGuard)
@RequirePermission(AdminPermission.MANAGE_DRIVER_PAYMENTS)
export class AdminDriverPaymentsController {
  constructor(
    private readonly driverPaymentService: DriverPaymentService,
    private readonly audit: AdminAuditService,
  ) {}

  @Get('admin/driver-payments')
  async list(@Query('driverId') driverId?: string) {
    return this.driverPaymentService.list(driverId);
  }

  @Get('admin/driver-payments/totals')
  async totals(@Query('driverId') driverId?: string) {
    return this.driverPaymentService.totals(driverId);
  }

  @Get('admin/driver-payments/ride-summary/:driverId')
  async rideSummary(
    @Param('driverId') driverId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.driverPaymentService.rideSummary(driverId, startDate, endDate);
  }

  @Post('admin/driver-payments')
  async create(@Body() dto: CreateDriverPaymentDto, @Req() req: any) {
    const result = await this.driverPaymentService.create(dto);

    await this.audit.record(
      req.adminUser.id,
      'DRIVER_PAYMENT_CREATED',
      'DriverPayment',
      result.id,
      {
        driverId: result.driverId,
        frequency: result.frequency,
        amountPence: result.amountPence,
        status: result.status,
      },
    );

    return result;
  }

  @Patch('admin/driver-payments/:id/approve')
  async approve(@Param('id') id: string, @Req() req: any) {
    const result = await this.driverPaymentService.approve(id);

    await this.audit.record(
      req.adminUser.id,
      'DRIVER_PAYMENT_APPROVED',
      'DriverPayment',
      result.id,
      { driverId: result.driverId, amountPence: result.amountPence },
    );

    return result;
  }

  @Patch('admin/driver-payments/:id/transfer')
  async transfer(@Param('id') id: string, @Req() req: any) {
    const result = await this.driverPaymentService.markTransferred(id);

    await this.audit.record(
      req.adminUser.id,
      'DRIVER_PAYMENT_TRANSFER_INITIATED',
      'DriverPayment',
      result.id,
      { driverId: result.driverId, amountPence: result.amountPence },
    );

    return result;
  }

  @Patch('admin/driver-payments/:id/paid')
  async markPaid(@Param('id') id: string, @Req() req: any) {
    const result = await this.driverPaymentService.markPaid(id);

    await this.audit.record(
      req.adminUser.id,
      'DRIVER_PAYMENT_MARKED_PAID',
      'DriverPayment',
      result.id,
      { driverId: result.driverId, amountPence: result.amountPence },
    );

    return result;
  }

  @Patch('admin/driver-payments/:id/failed')
  async failed(@Param('id') id: string, @Req() req: any) {
    const result = await this.driverPaymentService.markFailed(id);

    await this.audit.record(
      req.adminUser.id,
      'DRIVER_PAYMENT_FAILED',
      'DriverPayment',
      result.id,
      { driverId: result.driverId, amountPence: result.amountPence },
    );

    return result;
  }
}
