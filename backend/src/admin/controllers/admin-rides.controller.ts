import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AdminPermission } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AdminGuard } from '../admin.guard';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { CurrentAdmin } from '../decorators/current-admin.decorator';
import { AdminRequestUser } from '../models/admin-request-user';
import { AdminAuditService } from '../admin-audit.service';
import { RideService } from '../../ride/ride.service';
import { CreateRideDto } from '../../ride/dto/create-ride.dto';
import { UpdateRideStatusDto } from '../../ride/dto/update-ride-status.dto';
import { AssignDriverDto } from '../../ride/dto/assign-driver.dto';
import { UpdateRideNotesDto } from '../../ride/dto/update-ride-notes.dto';

@Controller('admin/rides')
@UseGuards(JwtAuthGuard, AdminGuard)
@RequirePermission(AdminPermission.MANAGE_RIDES)
export class AdminRidesController {
  constructor(
    private readonly rideService: RideService,
    private readonly auditService: AdminAuditService,
  ) {}

  @Get()
  list() {
    return this.rideService.list();
  }

  @Get(':reference')
  getOne(@Param('reference') reference: string) {
    return this.rideService.getByReference(reference);
  }

  @Post()
  async create(@Body() dto: CreateRideDto, @CurrentAdmin() actor: AdminRequestUser) {
    const ride = await this.rideService.createFromBooking(dto);
    await this.auditService.record(actor.id, 'CREATE_RIDE', 'Ride', ride.rideReference, {
      bookingReference: dto.bookingReference,
    });
    return ride;
  }

  @Patch(':reference/status')
  async updateStatus(
    @Param('reference') reference: string,
    @Body() dto: UpdateRideStatusDto,
    @CurrentAdmin() actor: AdminRequestUser,
  ) {
    const ride = await this.rideService.updateStatus(reference, dto.status);
    await this.auditService.record(actor.id, 'UPDATE_RIDE_STATUS', 'Ride', reference, { status: dto.status });
    return ride;
  }

  @Patch(':reference/driver')
  async assignDriver(
    @Param('reference') reference: string,
    @Body() dto: AssignDriverDto,
    @CurrentAdmin() actor: AdminRequestUser,
  ) {
    const ride = await this.rideService.assignDriver(reference, dto);
    await this.auditService.record(actor.id, 'ASSIGN_RIDE_DRIVER', 'Ride', reference, { driverId: dto.driverId ?? null });
    return ride;
  }

  @Patch(':reference/notes')
  async updateNotes(
    @Param('reference') reference: string,
    @Body() dto: UpdateRideNotesDto,
    @CurrentAdmin() actor: AdminRequestUser,
  ) {
    const ride = await this.rideService.updateNotes(reference, dto);
    await this.auditService.record(actor.id, 'UPDATE_RIDE_NOTES', 'Ride', reference);
    return ride;
  }
}