import { DriverEarningRuleType } from '@prisma/client';

export class UpdateFareConfigDto {
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
}
