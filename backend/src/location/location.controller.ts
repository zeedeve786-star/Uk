import { Controller, Get, Query } from '@nestjs/common';
import { LocationService } from './location.service';

@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get('autocomplete')
  autocomplete(@Query('input') input: string) {
    return this.locationService.autocomplete(input ?? '');
  }
}
