import { Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { AdminPermission } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AdminGuard } from '../admin.guard';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { NotificationService } from '../../notification/notification.service';

@Controller('admin/notifications')
@UseGuards(JwtAuthGuard, AdminGuard)
@RequirePermission(AdminPermission.VIEW_NOTIFICATIONS)
export class AdminNotificationsController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  list(@Query('unread') unread?: string) {
    return this.notificationService.list(unread === 'true');
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string) {
    return this.notificationService.markRead(id);
  }
}
