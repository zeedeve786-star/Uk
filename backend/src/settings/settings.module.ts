import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { PublicSettingsController } from './public-settings.controller';

@Module({
  controllers: [PublicSettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}