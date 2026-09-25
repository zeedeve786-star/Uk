export type AdminRole = 'CUSTOMER' | 'DRIVER' | 'ADMIN';

export type AdminPermission =
  | 'MANAGE_BOOKINGS'
  | 'MANAGE_DISCOUNTS'
  | 'VIEW_FARE_CONFIG'
  | 'MANAGE_ADMINS'
  | 'VIEW_AUDIT_LOG'
  | 'MANAGE_CONTENT'
  | 'MANAGE_SETTINGS'
  | 'MANAGE_DRIVERS'
  | 'MANAGE_RIDES'
  | 'MANAGE_AVAILABILITY'
  | 'VIEW_NOTIFICATIONS'
  | 'MANAGE_DRIVER_PAYMENTS';

export interface AuthenticatedAdmin {
  id: string;
  email: string;
  role: AdminRole;
}

export interface AdminUserRow {
  id: string;
  email: string;
  role: AdminRole;
  isMasterAdmin: boolean;
  adminPermissions: AdminPermission[];
  createdAt: string;
}

export interface AdminBookingRow {
  id: string;
  bookingReference: string;
  pickup: string;
  destination: string;
  journeyDate: string;
  journeyTime: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  leadPassengerName: string | null;
  leadPassengerEmail: string | null;
  leadPassengerPhone: string | null;
  passengerCount: number;
  luggageCount: number | null;
  handCarryCount: number | null;
  luggageNotes: string | null;
  customerNotes: string | null;
  vehicleCategory: string;
  originalFarePence: number;
  discountCode: string | null;
  discountAmountPence: number;
  finalFarePence: number;
  paidAmountPence: number;
  currency: string;
  validationStatus: string;
  partnerBookingReference: string | null;
  estimatedDistanceMiles: number | null;
  realDistanceMiles: number | null;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  bookingStatus: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
  ride: {
    rideReference: string;
    status: RideStatus;
    driver: DriverProfileRow | null;
  } | null;
}

export interface AdminDiscountRow {
  id: string;
  code: string;
  active: boolean;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  startsAt: string | null;
  endsAt: string | null;
  minimumFarePence: number | null;
  maximumDiscountPence: number | null;
  createdAt: string;
}

export interface AdminAuditLogRow {
  id: string;
  actorUserId: string;
  action: string;
  targetType: string;
  targetId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface FareConfig {
  id: string;
  currency: string;
  baseFarePence: number;
  perMilePence: number;
  perExtraStopPence: number;
  minimumFarePence: number;
  vehicleMultipliers: Record<string, number>;
  driverEarningRuleType: 'NONE' | 'FIXED' | 'PERCENTAGE';
  driverEarningValue: number | null;
  companyChargePence: number | null;
  companyChargePercentage: number | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ContentStatus = 'DRAFT' | 'PUBLISHED';

export type ServiceContentType = 'AIRPORT' | 'RAILWAY' | 'CRUISE' | 'EVENT';

export interface BlogRow {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featuredImageUrl: string | null;
  category: string | null;
  status: ContentStatus;
  metaTitle: string | null;
  metaDescription: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceContentRow {
  id: string;
  type: ServiceContentType;
  title: string;
  slug: string;
  description: string;
  eventType: string | null;
  imageUrls: string[];
  videoUrls: string[];
  relatedBlogSlugs: string[];
  status: ContentStatus;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

export type VehicleCategoryId =
  | 'saloon'
  | 'estate'
  | 'mpv'
  | 'executive'
  | 'eight-seater';

export interface VehicleContentRow {
  id: string;
  vehicleCategory: VehicleCategoryId;
  title: string;
  description: string;
  imageUrls: string[];
  videoUrls: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformSettingsRow {
  id: string;
  companyName: string | null;
  phoneDisplay: string | null;
  phoneTel: string | null;
  whatsappNumber: string | null;
  contactEmail: string | null;
  logoUrl: string | null;
  tickerMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export type MediaType = 'IMAGE' | 'VIDEO';

export interface MediaAssetRow {
  id: string;
  url: string;
  altText: string | null;
  mediaType: MediaType;
  createdAt: string;
}
export type ApiStatus = 'ACTIVE' | 'INACTIVE';

export interface ApiIntegrationRow {
  id: string;
  name: string;
  provider: string;
  baseUrl: string;
  apiKey: string | null;
  description: string | null;
  status: ApiStatus;
  createdAt: string;
  updatedAt: string;
}


export type DriverStatus = 'OFFLINE' | 'AVAILABLE' | 'ON_RIDE';

export interface AdminDriverRow {
  id: string;
  userId: string;
  name: string | null;
  email: string;
  status: DriverStatus;
  vehicleCategory: VehicleCategoryId | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}
export type RideStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface RideRow {
  id: string;
  rideReference: string;
  status: RideStatus;
  driverId: string | null;
  operationalNotes: string | null;
  driver: DriverProfileRow | null;
  createdAt: string;
  booking: {
    bookingReference: string;
    pickup: string;
    destination: string;
    journeyDate: string;
    journeyTime: string;
    customerName: string;
    vehicleCategory: string;
    finalFarePence: number;
    paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
    bookingStatus: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  };
}
export interface AvailabilityBlockRow {
  id: string;
  vehicleCategory: VehicleCategoryId;
  startsAt: string;
  endsAt: string;
  reason: string | null;
  createdAt: string;
}

export interface ConflictingBookingSummary {
  bookingReference: string;
  journeyDate: string;
  journeyTime: string;
  bookingStatus: string;
}

export interface AvailabilityCheckResult {
  vehicleCategory: VehicleCategoryId;
  date: string;
  time: string;
  available: boolean;
  conflictingBlocks: AvailabilityBlockRow[];
  conflictingBookings: ConflictingBookingSummary[];
}

export interface DriverProfileRow {
  id: string;
  userId: string;
  name: string | null;
  email: string;
  status: DriverStatus;
  vehicleCategory: VehicleCategoryId | null;
  phone: string | null;
  createdAt: string;
}

export type NotificationType = 'BOOKING_CREATED' | 'PAYMENT_SUCCEEDED' | 'PAYMENT_FAILED' | 'RIDE_STATUS_CHANGED' | 'DRIVER_ASSIGNED';
export type NotificationRecipientType = 'CUSTOMER' | 'DRIVER' | 'ADMIN';

export interface NotificationRow {
  id: string;
  type: NotificationType;
  recipientType: NotificationRecipientType;
  recipientUserId: string | null;
  recipientContact: string | null;
  referenceType: string;
  referenceId: string;
  message: string;
  read: boolean;
  createdAt: string;
}


export type DriverPaymentFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export type DriverPaymentStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'TRANSFER_INITIATED'
  | 'PAID'
  | 'FAILED'
  | 'CANCELLED';

export type DriverPaymentMethod = 'BANK_TRANSFER' | 'CASH' | 'OTHER';
export type DriverPaymentProvider = 'INTERNAL' | 'STRIPE_CONNECT' | 'BANK_API' | 'OTHER';

export interface DriverPaymentRow {
  id: string;
  driverId: string;
  driverEmail: string;
  driverPhone: string | null;
  frequency: DriverPaymentFrequency;
  rideCount: number;
  amountPence: number;
  currency: string;
  paymentDate: string;
  status: DriverPaymentStatus;
  paymentReference: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DriverPaymentTotals {
  totalPence: number;
  paidPence: number;
  pendingPence: number;
  dailyPence: number;
  weeklyPence: number;
  monthlyPence: number;
}
