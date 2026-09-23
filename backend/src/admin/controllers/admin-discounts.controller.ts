import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminPermission } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AdminGuard } from '../admin.guard';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { CurrentAdmin } from '../decorators/current-admin.decorator';
import { AdminRequestUser } from '../models/admin-request-user';
import { AdminAuditService } from '../admin-audit.service';
import { DiscountService } from '../../discount/discount.service';
import { AdminCreateDiscountDto } from '../../discount/dto/admin-create-discount.dto';
import { AdminUpdateDiscountDto } from '../../discount/dto/admin-update-discount.dto';

@Controller('admin/discounts')
@UseGuards(JwtAuthGuard, AdminGuard)
@RequirePermission(AdminPermission.MANAGE_DISCOUNTS)
export class AdminDiscountsController {
  constructor(
    private readonly discountService: DiscountService,
    private readonly auditService: AdminAuditService,
  ) {}

  @Get()
  list() {
    return this.discountService.listDiscounts();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.discountService.getDiscountById(id);
  }

  @Post()
  async create(
    @Body() dto: AdminCreateDiscountDto,
    @CurrentAdmin() actor: AdminRequestUser,
  ) {
    const discount = await this.discountService.createDiscount(dto);

    await this.auditService.record(
      actor.id,
      'CREATE_DISCOUNT',
      'Discount',
      discount.id,
      { code: discount.code },
    );

    return discount;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: AdminUpdateDiscountDto,
    @CurrentAdmin() actor: AdminRequestUser,
  ) {
    const discount = await this.discountService.updateDiscount(id, dto);

    await this.auditService.record(
      actor.id,
      'UPDATE_DISCOUNT',
      'Discount',
      discount.id,
      dto as Record<string, unknown>,
    );

    return discount;
  }
}
