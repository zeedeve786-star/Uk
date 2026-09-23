import { Controller, Get } from '@nestjs/common';
import { SettingsService } from './settings.service';

// No secrets stored here — public contact/business presentation info only.
@Controller('content/settings')
export class PublicSettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  get() {
    return this.settingsService.getSettings();
  }
}