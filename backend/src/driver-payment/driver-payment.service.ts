import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DriverPaymentFrequency,
  DriverPaymentStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDriverPaymentDto } from './dto/create-driver-payment.dto';
import { DriverPaymentResult } from './models/driver-payment-result';

function dateOnly(value: Date | null): string | null {
  return value ? value.toISOString().slice(0, 10) : null;
}

function toResult(record: any): DriverPaymentResult {
  return {
    id: record.id,
    driverId: record.driverId,
    driverEmail: record.driver.user.email,
    driverPhone: record.driver.phone,
    frequency: record.frequency,
    amountPence: record.amountPence,
    currency: record.currency,
    paymentDate: record.paymentDate.toISOString().slice(0, 10),
    status: record.status,
    paymentMethod: record.paymentMethod,
    provider: record.provider,
    paymentReference: record.paymentReference,
    transferReference: record.transferReference,
    externalTransactionId: record.externalTransactionId,
    notes: record.notes,
    payrollPeriodStart: dateOnly(record.payrollPeriodStart),
    payrollPeriodEnd: dateOnly(record.payrollPeriodEnd),
    rideCount: record.rideCount,
    createdByUserId: record.createdByUserId,
    approvedAt: record.approvedAt?.toISOString() ?? null,
    transferredAt: record.transferredAt?.toISOString() ?? null,
    paidAt: record.paidAt?.toISOString() ?? null,
    failedAt: record.failedAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

@Injectable()
export class DriverPaymentService {
  constructor(private readonly prisma: PrismaService) {}

  async list(driverId?: string): Promise<DriverPaymentResult[]> {
    const where: Prisma.DriverPaymentWhereInput = driverId ? { driverId } : {};

    const records = await this.prisma.driverPayment.findMany({
      where,
      include: {
        driver: {
          include: { user: true },
        },
      },
      orderBy: [{ paymentDate: 'desc' }, { createdAt: 'desc' }],
    });

    return records.map(toResult);
  }

  async create(dto: CreateDriverPaymentDto): Promise<DriverPaymentResult> {
    const driver = await this.prisma.driverProfile.findUnique({
      where: { id: dto.driverId },
      include: { user: true },
    });

    if (!driver || driver.user.role !== 'DRIVER') {
      throw new NotFoundException('Driver not found');
    }

    if (!Number.isInteger(dto.amountPence) || dto.amountPence <= 0) {
      throw new BadRequestException('Payment amount must be greater than zero');
    }

    const paymentDate = new Date(`${dto.paymentDate}T00:00:00.000Z`);
    if (Number.isNaN(paymentDate.getTime())) {
      throw new BadRequestException('Invalid payment date');
    }

    const parseDate = (value?: string) => {
      if (!value) return null;
      const parsed = new Date(`${value}T00:00:00.000Z`);
      if (Number.isNaN(parsed.getTime())) {
        throw new BadRequestException('Invalid payroll period date');
      }
      return parsed;
    };

    const record = await this.prisma.driverPayment.create({
      data: {
        driverId: dto.driverId,
        frequency: dto.frequency,
        amountPence: dto.amountPence,
        paymentDate,
        status: dto.status ?? DriverPaymentStatus.PENDING,
        paymentMethod: dto.paymentMethod,
        provider: dto.provider,
        paymentReference: dto.paymentReference?.trim() || null,
        transferReference: dto.transferReference?.trim() || null,
        externalTransactionId: dto.externalTransactionId?.trim() || null,
        notes: dto.notes?.trim() || null,
        payrollPeriodStart: parseDate(dto.payrollPeriodStart),
        payrollPeriodEnd: parseDate(dto.payrollPeriodEnd),
        rideCount: dto.rideCount ?? 0,
      },
      include: {
        driver: {
          include: { user: true },
        },
      },
    });

    return toResult(record);
  }

  async approve(id: string): Promise<DriverPaymentResult> {
    const existing = await this.prisma.driverPayment.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Driver payment not found');
    }

    if (
      existing.status !== DriverPaymentStatus.PENDING &&
      existing.status !== DriverPaymentStatus.FAILED
    ) {
      throw new BadRequestException('Only pending or failed payments can be approved');
    }

    return toResult(
      await this.prisma.driverPayment.update({
        where: { id },
        data: {
          status: DriverPaymentStatus.APPROVED,
          approvedAt: new Date(),
          failedAt: null,
        },
        include: { driver: { include: { user: true } } },
      }),
    );
  }

  async markTransferred(id: string): Promise<DriverPaymentResult> {
    const existing = await this.prisma.driverPayment.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Driver payment not found');
    }

    if (existing.status !== DriverPaymentStatus.APPROVED) {
      throw new BadRequestException('Payment must be approved before transfer');
    }

    return toResult(
      await this.prisma.driverPayment.update({
        where: { id },
        data: {
          status: DriverPaymentStatus.TRANSFER_INITIATED,
          transferredAt: new Date(),
        },
        include: { driver: { include: { user: true } } },
      }),
    );
  }

  async markPaid(id: string): Promise<DriverPaymentResult> {
    const existing = await this.prisma.driverPayment.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Driver payment not found');
    }

    if (
      existing.status !== DriverPaymentStatus.TRANSFER_INITIATED &&
      existing.status !== DriverPaymentStatus.APPROVED &&
      existing.status !== DriverPaymentStatus.PENDING
    ) {
      throw new BadRequestException('Payment cannot be marked paid from its current status');
    }

    return toResult(
      await this.prisma.driverPayment.update({
        where: { id },
        data: {
          status: DriverPaymentStatus.PAID,
          paidAt: new Date(),
        },
        include: { driver: { include: { user: true } } },
      }),
    );
  }

  async markFailed(id: string): Promise<DriverPaymentResult> {
    const existing = await this.prisma.driverPayment.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Driver payment not found');
    }

    return toResult(
      await this.prisma.driverPayment.update({
        where: { id },
        data: {
          status: DriverPaymentStatus.FAILED,
          failedAt: new Date(),
        },
        include: { driver: { include: { user: true } } },
      }),
    );
  }

  async rideSummary(driverId?: string, startDate?: string, endDate?: string) {
    const where: Prisma.RideWhereInput = {};

    if (driverId) {
      where.driverId = driverId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(`${startDate}T00:00:00.000Z`);
      }
      if (endDate) {
        where.createdAt.lte = new Date(`${endDate}T23:59:59.999Z`);
      }
    }

    const rides = await this.prisma.ride.findMany({
      where,
      include: {
        booking: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const completedRides = rides.filter(
      (ride) => ride.status === 'COMPLETED',
    );

    const totalEarningsPence = completedRides.reduce(
      (sum, ride) => sum + (ride.driverEarningPence ?? 0),
      0,
    );

    return {
      driverId: driverId ?? null,
      startDate: startDate ?? null,
      endDate: endDate ?? null,
      rideCount: rides.length,
      earningPence: totalEarningsPence,
      totalRides: rides.length,
      completedRides: completedRides.length,
      totalEarningsPence,
      rides: rides.map((ride) => ({
        id: ride.id,
        rideId: ride.id,
        rideReference: ride.rideReference,
        bookingReference: ride.booking.bookingReference,
        status: ride.status,
        driverId: ride.driverId,
        journeyDate: ride.booking.journeyDate.toISOString().slice(0, 10),
        journeyTime: ride.booking.journeyTime,
        vehicleCategory: ride.booking.vehicleCategory,
        customerFarePence: ride.booking.finalFarePence,
        driverEarningPence: ride.driverEarningPence ?? 0,
        currency: ride.booking.currency,
      })),
    };
  }

  async totals(driverId?: string) {
    const records = await this.prisma.driverPayment.findMany({
      where: driverId ? { driverId } : {},
      select: {
        amountPence: true,
        status: true,
        frequency: true,
      },
    });

    return {
      totalPence: records.reduce((sum, item) => sum + item.amountPence, 0),
      paidPence: records
        .filter((item) => item.status === DriverPaymentStatus.PAID)
        .reduce((sum, item) => sum + item.amountPence, 0),
      pendingPence: records
        .filter(
          (item) =>
            item.status === DriverPaymentStatus.PENDING ||
            item.status === DriverPaymentStatus.APPROVED ||
            item.status === DriverPaymentStatus.TRANSFER_INITIATED,
        )
        .reduce((sum, item) => sum + item.amountPence, 0),
      failedPence: records
        .filter((item) => item.status === DriverPaymentStatus.FAILED)
        .reduce((sum, item) => sum + item.amountPence, 0),
      dailyPence: records
        .filter((item) => item.frequency === DriverPaymentFrequency.DAILY)
        .reduce((sum, item) => sum + item.amountPence, 0),
      weeklyPence: records
        .filter((item) => item.frequency === DriverPaymentFrequency.WEEKLY)
        .reduce((sum, item) => sum + item.amountPence, 0),
      monthlyPence: records
        .filter((item) => item.frequency === DriverPaymentFrequency.MONTHLY)
        .reduce((sum, item) => sum + item.amountPence, 0),
    };
  }
}
