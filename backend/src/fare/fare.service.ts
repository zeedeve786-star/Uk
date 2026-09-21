import { Injectable } from '@nestjs/common';
import { DriverEarningRuleType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CalculateFareDto } from './dto/calculate-fare.dto';
import { FareResult } from './models/fare-result';
import { fareConfig } from './pricing.config';

function toPounds(pence: number): number {
  return Math.round(pence) / 100;
}

@Injectable()
export class FareService {
  constructor(private readonly prisma: PrismaService) {}

  async getActiveConfiguration() {
    const existing = await this.prisma.fareConfiguration.findFirst({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.fareConfiguration.create({
      data: {
        currency: fareConfig.currency,
        baseFarePence: fareConfig.baseFarePence,
        perMilePence: fareConfig.perMilePence,
        perExtraStopPence: fareConfig.perExtraStopPence,
        minimumFarePence: fareConfig.minimumFarePence,
        saloonMultiplier: fareConfig.vehicleMultipliers.saloon,
        estateMultiplier: fareConfig.vehicleMultipliers.estate,
        mpvMultiplier: fareConfig.vehicleMultipliers.mpv,
        executiveMultiplier: fareConfig.vehicleMultipliers.executive,
        eightSeaterMultiplier: fareConfig.vehicleMultipliers['eight-seater'],
        driverEarningRuleType: DriverEarningRuleType.NONE,
        driverEarningValue: null,
        companyChargePence: null,
        companyChargePercentage: null,
        active: true,
      },
    });
  }

  async calculateFare(dto: CalculateFareDto): Promise<FareResult> {
    const config = await this.getActiveConfiguration();

    const multiplierMap: Record<string, number> = {
      saloon: config.saloonMultiplier,
      estate: config.estateMultiplier,
      mpv: config.mpvMultiplier,
      executive: config.executiveMultiplier,
      'eight-seater': config.eightSeaterMultiplier,
    };

    const multiplier = multiplierMap[dto.vehicleCategory];

    if (multiplier === undefined) {
      throw new Error(`No fare multiplier configured for ${dto.vehicleCategory}`);
    }

    const distanceChargePence = Math.round(dto.distanceMiles * config.perMilePence);
    const extraStopChargePence = dto.extraStopCount * config.perExtraStopPence;
    const subtotalPence =
      config.baseFarePence + distanceChargePence + extraStopChargePence;
    const multipliedPence = Math.round(subtotalPence * multiplier);
    const totalPence = Math.max(multipliedPence, config.minimumFarePence);

    return {
      baseFare: toPounds(config.baseFarePence),
      distance: dto.distanceMiles,
      distanceCharge: toPounds(distanceChargePence),
      extraStopCharge: toPounds(extraStopChargePence),
      vehicleMultiplier: multiplier,
      totalFare: toPounds(totalPence),
      currency: config.currency as 'GBP',
    };
  }

  async calculateDriverEarning(
    farePence: number,
  ): Promise<{
    driverEarningPence: number;
    companyChargePence: number;
    source: string;
  }> {
    const config = await this.getActiveConfiguration();

    let driverEarningPence = 0;

    if (
      config.driverEarningRuleType === DriverEarningRuleType.FIXED &&
      config.driverEarningValue != null
    ) {
      driverEarningPence = Math.round(config.driverEarningValue);
    }

    if (
      config.driverEarningRuleType === DriverEarningRuleType.PERCENTAGE &&
      config.driverEarningValue != null
    ) {
      driverEarningPence = Math.round(
        farePence * (config.driverEarningValue / 100),
      );
    }

    const configuredFixedCharge = config.companyChargePence ?? 0;
    const configuredPercentageCharge =
      config.companyChargePercentage != null
        ? Math.round(farePence * (config.companyChargePercentage / 100))
        : 0;

    const companyChargePence = Math.max(
      configuredFixedCharge,
      configuredPercentageCharge,
    );

    if (driverEarningPence < 0 || driverEarningPence > farePence) {
      throw new Error('Configured driver earning exceeds the customer fare');
    }

    if (companyChargePence < 0 || companyChargePence > farePence) {
      throw new Error('Configured company charge exceeds the customer fare');
    }

    if (driverEarningPence + companyChargePence > farePence) {
      throw new Error(
        'Configured driver earning and company charge exceed the customer fare',
      );
    }

    return {
      driverEarningPence,
      companyChargePence,
      source: `FARE_CONFIGURATION:${config.driverEarningRuleType}`,
    };
  }

  async getPricingConfig() {
    const config = await this.getActiveConfiguration();

    return {
      id: config.id,
      currency: config.currency,
      baseFarePence: config.baseFarePence,
      perMilePence: config.perMilePence,
      perExtraStopPence: config.perExtraStopPence,
      minimumFarePence: config.minimumFarePence,
      vehicleMultipliers: {
        saloon: config.saloonMultiplier,
        estate: config.estateMultiplier,
        mpv: config.mpvMultiplier,
        executive: config.executiveMultiplier,
        'eight-seater': config.eightSeaterMultiplier,
      },
      driverEarningRuleType: config.driverEarningRuleType,
      driverEarningValue: config.driverEarningValue,
      companyChargePence: config.companyChargePence,
      companyChargePercentage: config.companyChargePercentage,
      active: config.active,
      createdAt: config.createdAt.toISOString(),
      updatedAt: config.updatedAt.toISOString(),
    };
  }

  async updateConfiguration(input: {
    currency?: string;
    baseFarePence?: number;
    perMilePence?: number;
    perExtraStopPence?: number;
    minimumFarePence?: number;
    saloonMultiplier?: number;
    estateMultiplier?: number;
    mpvMultiplier?: number;
    executiveMultiplier?: number;
    eightSeaterMultiplier?: number;
    driverEarningRuleType?: DriverEarningRuleType;
    driverEarningValue?: number | null;
    companyChargePence?: number | null;
    companyChargePercentage?: number | null;
    active?: boolean;
  }) {
    const existing = await this.getActiveConfiguration();

    const positiveIntegers = [
      input.baseFarePence,
      input.perMilePence,
      input.perExtraStopPence,
      input.minimumFarePence,
    ];

    for (const value of positiveIntegers) {
      if (value !== undefined && (!Number.isInteger(value) || value < 0)) {
        throw new Error('Fare amounts must be whole numbers and cannot be negative');
      }
    }

    const multipliers = [
      input.saloonMultiplier,
      input.estateMultiplier,
      input.mpvMultiplier,
      input.executiveMultiplier,
      input.eightSeaterMultiplier,
    ];

    for (const value of multipliers) {
      if (value !== undefined && (!Number.isFinite(value) || value <= 0)) {
        throw new Error('Vehicle multipliers must be greater than zero');
      }
    }

    if (
      input.driverEarningValue !== undefined &&
      input.driverEarningValue !== null &&
      (!Number.isFinite(input.driverEarningValue) || input.driverEarningValue < 0)
    ) {
      throw new Error('Driver earning value cannot be negative');
    }

    if (
      input.driverEarningRuleType === DriverEarningRuleType.PERCENTAGE &&
      input.driverEarningValue !== undefined &&
      input.driverEarningValue !== null &&
      input.driverEarningValue > 100
    ) {
      throw new Error('Driver earning percentage cannot exceed 100');
    }

    if (
      input.companyChargePercentage !== undefined &&
      input.companyChargePercentage !== null &&
      (!Number.isFinite(input.companyChargePercentage) ||
        input.companyChargePercentage < 0 ||
        input.companyChargePercentage > 100)
    ) {
      throw new Error('Company charge percentage must be between 0 and 100');
    }

    if (
      input.companyChargePence !== undefined &&
      input.companyChargePence !== null &&
      (!Number.isInteger(input.companyChargePence) || input.companyChargePence < 0)
    ) {
      throw new Error('Company charge must be a whole number and cannot be negative');
    }

    return this.prisma.fareConfiguration.update({
      where: { id: existing.id },
      data: {
        ...(input.currency !== undefined ? { currency: input.currency.trim().toUpperCase() } : {}),
        ...(input.baseFarePence !== undefined ? { baseFarePence: input.baseFarePence } : {}),
        ...(input.perMilePence !== undefined ? { perMilePence: input.perMilePence } : {}),
        ...(input.perExtraStopPence !== undefined ? { perExtraStopPence: input.perExtraStopPence } : {}),
        ...(input.minimumFarePence !== undefined ? { minimumFarePence: input.minimumFarePence } : {}),
        ...(input.saloonMultiplier !== undefined ? { saloonMultiplier: input.saloonMultiplier } : {}),
        ...(input.estateMultiplier !== undefined ? { estateMultiplier: input.estateMultiplier } : {}),
        ...(input.mpvMultiplier !== undefined ? { mpvMultiplier: input.mpvMultiplier } : {}),
        ...(input.executiveMultiplier !== undefined ? { executiveMultiplier: input.executiveMultiplier } : {}),
        ...(input.eightSeaterMultiplier !== undefined ? { eightSeaterMultiplier: input.eightSeaterMultiplier } : {}),
        ...(input.driverEarningRuleType !== undefined ? { driverEarningRuleType: input.driverEarningRuleType } : {}),
        ...(input.driverEarningValue !== undefined ? { driverEarningValue: input.driverEarningValue } : {}),
        ...(input.companyChargePence !== undefined ? { companyChargePence: input.companyChargePence } : {}),
        ...(input.companyChargePercentage !== undefined ? { companyChargePercentage: input.companyChargePercentage } : {}),
        ...(input.active !== undefined ? { active: input.active } : {}),
      },
    });
  }
}
