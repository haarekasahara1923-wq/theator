import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { redis } from '@/lib/redis';
import { bookings, screens, timeSlots, screenSlotAvailability } from '@/lib/schema';
import { eq, and, desc, gte, lte, sql } from 'drizzle-orm';
import { format } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const screen = searchParams.get('screen');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query with joins
    const results = await db
      .select({
        id: bookings.id,
        bookingRef: bookings.bookingRef,
        bookingDate: bookings.bookingDate,
        customerName: bookings.customerName,
        customerMobile: bookings.customerMobile,
        customerEmail: bookings.customerEmail,
        partyType: bookings.partyType,
        personsCount: bookings.personsCount,
        totalHours: bookings.totalHours,
        totalAmount: bookings.totalAmount,
        paymentStatus: bookings.paymentStatus,
        bookingStatus: bookings.bookingStatus,
        whatsappSent: bookings.whatsappSent,
        emailSent: bookings.emailSent,
        createdAt: bookings.createdAt,
        screenName: screens.name,
        startSlotLabel: sql<string>`start_slot.slot_label`.as('startSlotLabel'),
        endSlotLabel: sql<string>`end_slot.slot_label`.as('endSlotLabel'),
      })
      .from(bookings)
      .leftJoin(screens, eq(bookings.screenId, screens.id))
      .leftJoin(sql`time_slots as start_slot`, sql`bookings.start_slot_id = start_slot.id`)
      .leftJoin(sql`time_slots as end_slot`, sql`bookings.end_slot_id = end_slot.id`)
      .orderBy(desc(bookings.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({ bookings: results, total: results.length });
  } catch (error) {
    console.error('Admin bookings GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const role = req.headers.get('x-admin-role');
    const { bookingId, action } = await req.json();

    if (!bookingId || !action) {
      return NextResponse.json({ error: 'bookingId and action required' }, { status: 400 });
    }

    if (action === 'cancel') {
      // Get booking details
      const [booking] = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
      if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

      // Update booking status
      await db.update(bookings)
        .set({ bookingStatus: 'cancelled' })
        .where(eq(bookings.id, bookingId));

      // Free slots
      await db.update(screenSlotAvailability)
        .set({ status: 'available', bookingId: null })
        .where(eq(screenSlotAvailability.bookingId, bookingId));

      // Invalidate cache
      await redis.del(`availability:${booking.bookingDate}`).catch(() => null);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Admin bookings PATCH error:', error);
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}
