import { FareService } from './fare.service';
import { VehicleCategoryId } from './dto/calculate-fare.dto';
import { fareConfig } from './pricing.config';

describe('FareService', () => {
  let service: FareService;

  beforeEach(() => {
    service = new FareService({
      fareConfiguration: {
        findFirst: jest.fn().mockResolvedValue({
  currency: 'GBP',
  baseFarePence: 500,
  perMilePence: 150,
  perExtraStopPence: 300,
  minimumFarePence: 800,
  saloonMultiplier: 1,
  estateMultiplier: 1.1,
  mpvMultiplier: 1.3,
  executiveMultiplier: 1.6,
  eightSeaterMultiplier: 1.8,
  driverEarningRuleType: 'NONE',
  driverEarningValue: null,
  companyChargePence: null,
  companyChargePercentage: null,
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}),
        create: jest.fn(),
      },
    } as any);
  });

  function expectedTotalPence(distanceMiles: number, category: VehicleCategoryId, extraStopCount: number): number {
    const multiplier = fareConfig.vehicleMultipliers[category];
    const distanceChargePence = Math.round(distanceMiles * fareConfig.perMilePence);
    const extraStopChargePence = extraStopCount * fareConfig.perExtraStopPence;
    const subtotal = fareConfig.baseFarePence + distanceChargePence + extraStopChargePence;
    const multiplied = Math.round(subtotal * multiplier);
    return Math.max(multiplied, fareConfig.minimumFarePence);
  }

  const categories = [
    VehicleCategoryId.SALOON,
    VehicleCategoryId.ESTATE,
    VehicleCategoryId.MPV,
    VehicleCategoryId.EXECUTIVE,
    VehicleCategoryId.EIGHT_SEATER,
  ];

  it.each(categories)('calculates a valid fare for %s', async (category) => {
    const result = await service.calculateFare({ distanceMiles: 12, vehicleCategory: category, extraStopCount: 1 });
    const expectedPence = expectedTotalPence(12, category, 1);
    expect(result.totalFare).toBeCloseTo(expectedPence / 100, 2);
    expect(result.currency).toBe('GBP');
    expect(result.vehicleMultiplier).toBe(fareConfig.vehicleMultipliers[category]);
  });

  it('produces a deterministic result for identical inputs', async () => {
    const input = { distanceMiles: 8.4, vehicleCategory: VehicleCategoryId.EXECUTIVE, extraStopCount: 2 };
    const first = await service.calculateFare(input);
    const second = await service.calculateFare(input);
    expect(first).toEqual(second);
  });

  it('never returns a client-supplied totalFare — the server always computes it', async () => {
    const spoofed = {
      distanceMiles: 5,
      vehicleCategory: VehicleCategoryId.SALOON,
      extraStopCount: 0,
      totalFare: 1,
    } as any;
    const result = await service.calculateFare(spoofed);
    const expectedPence = expectedTotalPence(5, VehicleCategoryId.SALOON, 0);
    expect(result.totalFare).toBeCloseTo(expectedPence / 100, 2);
    expect(result.totalFare).not.toBe(1);
  });
});
describe('FareService.getPricingConfig (B9)', () => {
  it('returns the current pricing configuration read-only', async () => {
    const service = new FareService({
      fareConfiguration: {
        findFirst: jest.fn().mockResolvedValue({
  currency: 'GBP',
  baseFarePence: 500,
  perMilePence: 150,
  perExtraStopPence: 300,
  minimumFarePence: 800,
  saloonMultiplier: 1,
  estateMultiplier: 1.1,
  mpvMultiplier: 1.3,
  executiveMultiplier: 1.6,
  eightSeaterMultiplier: 1.8,
  driverEarningRuleType: 'NONE',
  driverEarningValue: null,
  companyChargePence: null,
  companyChargePercentage: null,
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}),
        create: jest.fn(),
      },
    } as any);
    const config = await service.getPricingConfig();
    expect(config.currency).toBe('GBP');
    expect(Object.keys(config.vehicleMultipliers)).toEqual(
      expect.arrayContaining(['saloon', 'estate', 'mpv', 'executive', 'eight-seater']),
    );
  });
});
