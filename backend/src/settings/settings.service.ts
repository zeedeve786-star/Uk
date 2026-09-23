import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

const SETTINGS_ID = 'singleton';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings() {
    const existing = await this.prisma.platformSettings.findUnique({ where: { id: SETTINGS_ID } });
    if (existing) {
      return existing;
    }
    return this.prisma.platformSettings.create({ data: { id: SETTINGS_ID } });
  }

  async updateSettings(dto: UpdateSettingsDto) {
    await this.getSettings(); // ensures the singleton row exists before updating
    return this.prisma.platformSettings.update({ where: { id: SETTINGS_ID }, data: dto });
  }
}