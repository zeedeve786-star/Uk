import { adminApi } from './adminHttpClient';
import type {
  DriverPaymentProvider,
  DriverPaymentMethod,
  DriverPaymentRow,
  DriverPaymentStatus,
  DriverPaymentTotals,
} from '../models';

export interface CreateDriverPaymentInput {
  driverId: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  amountPence: number;
  paymentDate: string;
  status?: DriverPaymentStatus;
  paymentMethod?: DriverPaymentMethod;
  provider?: DriverPaymentProvider;
  paymentReference?: string;
  transferReference?: string;
  externalTransactionId?: string;
  notes?: string;
  payrollPeriodStart?: string;
  payrollPeriodEnd?: string;
  rideCount?: number;
}

export interface DriverRideSummary {
  driverId: string;
  rideCount: number;
  earningPence: number;
  rides: Array<{
    id: string;
    rideReference: string;
    bookingReference: string;
    journeyDate: string;
    journeyTime: string;
    pickup: string;
    destination: string;
    customerFarePence: number;
    driverEarningPence: number;
    currency: string;
  }>;
}

export const driverPaymentsApi = {
  list: (driverId?: string) =>
    adminApi.get<DriverPaymentRow[]>(
      `/admin/driver-payments${driverId ? `?driverId=${encodeURIComponent(driverId)}` : ''}`,
    ),

  totals: (driverId?: string) =>
    adminApi.get<DriverPaymentTotals>(
      `/admin/driver-payments/totals${driverId ? `?driverId=${encodeURIComponent(driverId)}` : ''}`,
    ),

  rideSummary: (driverId: string, startDate?: string, endDate?: string) =>
    adminApi.get<DriverRideSummary>(
      `/admin/driver-payments/ride-summary/${encodeURIComponent(driverId)}${
        startDate || endDate
          ? `?${new URLSearchParams({
              ...(startDate ? { startDate } : {}),
              ...(endDate ? { endDate } : {}),
            }).toString()}`
          : ''
      }`,
    ),

  create: (input: CreateDriverPaymentInput) =>
    adminApi.post<DriverPaymentRow>('/admin/driver-payments', input),

  approve: (id: string) =>
    adminApi.patch<DriverPaymentRow>(`/admin/driver-payments/${id}/approve`, {}),

  transfer: (id: string) =>
    adminApi.patch<DriverPaymentRow>(`/admin/driver-payments/${id}/transfer`, {}),

  markPaid: (id: string) =>
    adminApi.patch<DriverPaymentRow>(`/admin/driver-payments/${id}/paid`, {}),

  markFailed: (id: string) =>
    adminApi.patch<DriverPaymentRow>(`/admin/driver-payments/${id}/failed`, {}),
};
