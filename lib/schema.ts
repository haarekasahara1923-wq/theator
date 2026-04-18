import {
  pgTable, uuid, text, integer, boolean,
  timestamp, date, time, uniqueIndex, jsonb
} from 'drizzle-orm/pg-core';

// ── Screens ──────────────────────────────────────────
export const screens = pgTable('screens', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  capacity: integer('capacity').notNull().default(10),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// ── Time Slots ────────────────────────────────────────
export const timeSlots = pgTable('time_slots', {
  id: uuid('id').primaryKey().defaultRandom(),
  slotLabel: text('slot_label').notNull(),
  startTime: time('start_time').notNull(),
  endTime: time('end_time').notNull(),
  slotOrder: integer('slot_order').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// ── Screen Slot Availability ──────────────────────────
export const screenSlotAvailability = pgTable('screen_slot_availability', {
  id: uuid('id').primaryKey().defaultRandom(),
  screenId: uuid('screen_id').references(() => screens.id),
  timeSlotId: uuid('time_slot_id').references(() => timeSlots.id),
  bookingDate: date('booking_date').notNull(),
  status: text('status').notNull().default('available'),
  bookingId: uuid('booking_id'),
}, (table) => ({
  uniqueSlot: uniqueIndex('unique_screen_slot_date').on(
    table.screenId, table.timeSlotId, table.bookingDate
  ),
}));

// ── Bookings ──────────────────────────────────────────
export const bookings = pgTable('bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  bookingRef: text('booking_ref').unique().notNull(),
  screenId: uuid('screen_id').references(() => screens.id),
  bookingDate: date('booking_date').notNull(),
  startSlotId: uuid('start_slot_id').references(() => timeSlots.id),
  endSlotId: uuid('end_slot_id').references(() => timeSlots.id),
  totalHours: integer('total_hours').notNull().default(1),
  partyType: text('party_type').notNull(),
  personsCount: integer('persons_count').notNull(),
  customerName: text('customer_name').notNull(),
  customerMobile: text('customer_mobile').notNull(),
  customerEmail: text('customer_email'),
  specialRequests: text('special_requests'),
  amountPerHour: integer('amount_per_hour').notNull(),
  totalAmount: integer('total_amount').notNull(),
  paymentStatus: text('payment_status').default('pending'),
  razorpayOrderId: text('razorpay_order_id'),
  razorpayPaymentId: text('razorpay_payment_id'),
  bookingStatus: text('booking_status').default('confirmed'),
  complementaryItems: jsonb('complementary_items'),
  whatsappSent: boolean('whatsapp_sent').default(false),
  emailSent: boolean('email_sent').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// ── Complementary Items ───────────────────────────────
export const complementaryItems = pgTable('complementary_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  imageUrl: text('image_url'),
  imagePublicId: text('image_public_id'),
  quantityPerBooking: integer('quantity_per_booking').notNull().default(1),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// ── Admins ────────────────────────────────────────────
export const admins = pgTable('admins', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull().default('admin'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// ── Pricing Config ────────────────────────────────────
export const pricingConfig = pgTable('pricing_config', {
  id: uuid('id').primaryKey().defaultRandom(),
  partyType: text('party_type').notNull().unique(),
  label: text('label').notNull(),
  personsMin: integer('persons_min').notNull(),
  personsMax: integer('persons_max'),
  pricePerHour: integer('price_per_hour').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ── Type exports ──────────────────────────────────────
export type Screen = typeof screens.$inferSelect;
export type TimeSlot = typeof timeSlots.$inferSelect;
export type ScreenSlotAvailability = typeof screenSlotAvailability.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type ComplementaryItem = typeof complementaryItems.$inferSelect;
export type Admin = typeof admins.$inferSelect;
export type PricingConfig = typeof pricingConfig.$inferSelect;
