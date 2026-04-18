import { db } from '@/lib/db';
import { bookings, screens } from '@/lib/schema';
import { eq, sql } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import BookingTicket from '@/components/booking/BookingTicket';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { bookingRef: string } }): Promise<Metadata> {
  return {
    title: `Booking Confirmed — ${params.bookingRef} | NV Theatre`,
    description: 'Your NV Theatre booking has been confirmed.',
  };
}

export default async function ConfirmationPage({ params }: { params: { bookingRef: string } }) {
  const { bookingRef } = params;

  const [booking] = await db
    .select({
      id: bookings.id,
      bookingRef: bookings.bookingRef,
      bookingDate: bookings.bookingDate,
      totalHours: bookings.totalHours,
      partyType: bookings.partyType,
      personsCount: bookings.personsCount,
      customerName: bookings.customerName,
      customerMobile: bookings.customerMobile,
      customerEmail: bookings.customerEmail,
      totalAmount: bookings.totalAmount,
      paymentStatus: bookings.paymentStatus,
      bookingStatus: bookings.bookingStatus,
      complementaryItems: bookings.complementaryItems,
      createdAt: bookings.createdAt,
      screenName: screens.name,
      startTime: sql<string>`start_slot.start_time`,
      endTime: sql<string>`end_slot.end_time`,
      startSlotLabel: sql<string>`start_slot.slot_label`,
      endSlotLabel: sql<string>`end_slot.slot_label`,
    })
    .from(bookings)
    .leftJoin(screens, eq(bookings.screenId, screens.id))
    .leftJoin(sql`time_slots as start_slot`, sql`bookings.start_slot_id = start_slot.id`)
    .leftJoin(sql`time_slots as end_slot`, sql`bookings.end_slot_id = end_slot.id`)
    .where(eq(bookings.bookingRef, bookingRef))
    .limit(1);

  if (!booking) return notFound();

  return <BookingTicket booking={booking} />;
}
