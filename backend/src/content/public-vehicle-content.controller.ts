import { Controller, Get } from '@nestjs/common';
import { VehicleContentService } from './vehicle-content.service';

@Controller('content/vehicles')
export class PublicVehicleContentController {
  constructor(private readonly service: VehicleContentService) {}

  @Get()
  list() {
    return this.service.listActive();
  }
}