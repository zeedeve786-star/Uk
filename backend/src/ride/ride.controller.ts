import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { RideService } from './ride.service';
import { CreateRideDto } from './dto/create-ride.dto';
import { AssignDriverDto } from './dto/assign-driver.dto';
import { UpdateRideNotesDto } from './dto/update-ride-notes.dto';

@Controller('rides')
export class RideController {
  constructor(private readonly rideService: RideService) {}

  @Post()
  create(@Body() dto: CreateRideDto) {
    return this.rideService.createFromBooking(dto);
  }

  @Get()
  list() {
    return this.rideService.list();
  }

  @Get(':reference')
  getOne(@Param('reference') reference: string) {
    return this.rideService.getByReference(reference);
  }

  @Patch(':reference/status')
  updateStatus(
    @Param('reference') reference: string,
    @Body() dto: { status: import('@prisma/client').RideStatus },
  ) {
    return this.rideService.updateStatus(reference, dto.status);
  }

  @Patch(':reference/driver')
  assignDriver(
    @Param('reference') reference: string,
    @Body() dto: AssignDriverDto,
  ) {
    return this.rideService.assignDriver(reference, dto);
  }

  @Patch(':reference/notes')
  updateNotes(
    @Param('reference') reference: string,
    @Body() dto: UpdateRideNotesDto,
  ) {
    return this.rideService.updateNotes(reference, dto);
  }
}
