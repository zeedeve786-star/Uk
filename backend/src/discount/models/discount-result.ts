import { DiscountType } from '@prisma/client';

export type Currency = 'GBP';

export interface DiscountResult {
  discountCode: string;
  discountType: DiscountType;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  currency: Currency;
}