export interface SlotStatus {
  slotId: string;
  slotLabel: string;
  startTime: string;
  endTime: string;
  slotOrder: number;
  screenAStatus: 'available' | 'booked' | 'locked' | 'blocked';
  screenBStatus: 'available' | 'booked' | 'locked' | 'blocked';
  screenABookingId?: string;
  screenBBookingId?: string;
  screenACustomerName?: string;
  screenBCustomerName?: string;
}

export interface BookingFormData {
  // Step 1
  bookingDate: string;
  // Step 2
  screenId: string;
  screenName: string;
  startSlotId: string;
  endSlotId: string;
  startSlotOrder: number;
  endSlotOrder: number;
  startTime: string;
  endTime: string;
  startSlotLabel: string;
  endSlotLabel: string;
  totalHours: number;
  // Step 3
  partyType: 'couple' | 'group_small' | 'group_large';
  personsCount: number;
  amountPerHour: number;
  totalAmount: number;
  // Step 4
  complementaryItems: ComplementaryItemSelection[];
  // Step 5
  customerName: string;
  customerMobile: string;
  customerEmail?: string;
  specialRequests?: string;
}

export interface ComplementaryItemSelection {
  item_id: string;
  name: string;
  quantity: number;
  imageUrl?: string;
}

export interface ApiAvailabilityResponse {
  date: string;
  slots: SlotStatus[];
  screenAId: string;
  screenBId: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'super_admin';
  isActive: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalBookingsToday: number;
  revenueToday: number;
  availableSlotsToday: number;
  totalRevenueThisMonth: number;
  totalBookingsThisMonth: number;
}

export interface BookingDetail {
  id: string;
  bookingRef: string;
  screenName: string;
  bookingDate: string;
  startSlotLabel: string;
  endSlotLabel: string;
  totalHours: number;
  partyType: string;
  personsCount: number;
  customerName: string;
  customerMobile: string;
  customerEmail?: string;
  specialRequests?: string;
  amountPerHour: number;
  totalAmount: number;
  paymentStatus: string;
  bookingStatus: string;
  complementaryItems?: ComplementaryItemSelection[];
  whatsappSent: boolean;
  emailSent: boolean;
  createdAt: string;
}
