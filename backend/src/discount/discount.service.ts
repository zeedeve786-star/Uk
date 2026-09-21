import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DiscountType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CalculateDiscountDto } from './dto/calculate-discount.dto';
import { AdminCreateDiscountDto } from './dto/admin-create-discount.dto';
import { AdminUpdateDiscountDto } from './dto/admin-update-discount.dto';
import { DiscountResult } from './models/discount-result';

function toPence(pounds: number): number {
  return Math.round(pounds * 100);
}

function toPounds(pence: number): number {
  return Math.round(pence) / 100;
}

@Injectable()
export class DiscountService {
  constructor(private readonly prisma: PrismaService) {}

  async calculateDiscount(dto: CalculateDiscountDto): Promise<DiscountResult> {
    const normalizedCode = dto.code.trim().toUpperCase();

    const discount = await this.prisma.discount.findUnique({ where: { code: normalizedCode } });
    if (!discount) {
      throw new NotFoundException('Invalid discount code');
    }
    if (!discount.active) {
      throw new BadRequestException('Discount is not active');
    }

    const now = new Date();
    if (discount.startsAt && now < discount.startsAt) {
      throw new BadRequestException('Discount is not yet active');
    }
    if (discount.endsAt && now > discount.endsAt) {
      throw new BadRequestException('Discount has expired');
    }

    const originalPence = toPence(dto.originalAmount);

    if (discount.minimumFarePence != null && originalPence < discount.minimumFarePence) {
      throw new BadRequestException('Fare does not meet the minimum amount required for this discount');
    }

    let discountPence =
      discount.type === DiscountType.PERCENTAGE
        ? Math.round((originalPence * discount.value) / 100)
        : discount.value;

    if (discount.maximumDiscountPence != null) {
      discountPence = Math.min(discountPence, discount.maximumDiscountPence);
    }

    discountPence = Math.max(0, Math.min(discountPence, originalPence));
    const finalPence = originalPence - discountPence;

    return {
      discountCode: discount.code,
      discountType: discount.type,
      originalAmount: toPounds(originalPence),
      discountAmount: toPounds(discountPence),
      finalAmount: toPounds(finalPence),
      currency: 'GBP',
    };
  }

  async createDiscount(dto: AdminCreateDiscountDto) {
    return this.prisma.discount.create({
      data: {
        code: dto.code.trim().toUpperCase(),
        active: dto.active ?? true,
        type: dto.type,
        value: dto.value,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
        minimumFarePence: dto.minimumFarePence ?? null,
        maximumDiscountPence: dto.maximumDiscountPence ?? null,
      },
    });
  }

  async listDiscounts() {
    return this.prisma.discount.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async getDiscountById(id: string) {
    const discount = await this.prisma.discount.findUnique({ where: { id } });
    if (!discount) {
      throw new NotFoundException('Discount not found');
    }
    return discount;
  }

  async updateDiscount(id: string, dto: AdminUpdateDiscountDto) {
    await this.getDiscountById(id);
    return this.prisma.discount.update({
      where: { id },
      data: {
        ...(dto.code !== undefined ? { code: dto.code.trim().toUpperCase() } : {}),
        ...(dto.active !== undefined ? { active: dto.active } : {}),
        ...(dto.type !== undefined ? { type: dto.type } : {}),
        ...(dto.value !== undefined ? { value: dto.value } : {}),
        ...(dto.startsAt !== undefined ? { startsAt: new Date(dto.startsAt) } : {}),
        ...(dto.endsAt !== undefined ? { endsAt: new Date(dto.endsAt) } : {}),
        ...(dto.minimumFarePence !== undefined ? { minimumFarePence: dto.minimumFarePence } : {}),
        ...(dto.maximumDiscountPence !== undefined ? { maximumDiscountPence: dto.maximumDiscountPence } : {}),
      },
    });
  }
}
