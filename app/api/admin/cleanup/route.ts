import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { redis } from '@/lib/redis';
import {
  bookings,
  screenSlotAvailability,
  timeSlots,
} from '@/lib/schema';
import { eq, and, inArray } from 'drizzle-orm';

/**
 * POST /api/admin/cleanup
 *
 * Scans all confirmed bookings for TODAY whose booking end-slot time has
 * already passed (IST) and marks their screenSlotAvailability rows back to
 * 'available'. This is a safe, idempotent operation.
 *
 * Can be called:
 *  - Manually from the admin panel
 *  - Via a Vercel Cron Job (e.g. every 30 min)
 */
export async function POST(req: NextRequest) {
  try {
    // IST "now"
    const now = new Date();
    const istTime = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
    const todayIST      = istTime.toISOString().split('T')[0]; // YYYY-MM-DD
    const currentTimeStr = istTime.toISOString().split('T')[1].slice(0, 5); // HH:MM

    // Fetch all confirmed bookings for today
    const todayBookings = await db
      .select({
        id:         bookings.id,
        bookingDate: bookings.bookingDate,
        endSlotId:  bookings.endSlotId,
      })
      .from(bookings)
      .where(
        and(
          eq(bookings.bookingDate, todayIST),
          eq(bookings.bookingStatus, 'confirmed'),
          eq(bookings.paymentStatus, 'paid'),
        )
      );

    if (!todayBookings.length) {
      return NextResponse.json({ freed: 0, message: 'No confirmed bookings today' });
    }

    // Fetch the endTime of every end-slot
    const endSlotIds = todayBookings
      .map(b => b.endSlotId)
      .filter((id): id is string => !!id);

    const endSlots = endSlotIds.length
      ? await db
          .select({ id: timeSlots.id, endTime: timeSlots.endTime })
          .from(timeSlots)
          .where(inArray(timeSlots.id, endSlotIds))
      : [];

    const endSlotTimeMap = new Map(endSlots.map(s => [s.id, s.endTime]));

    // Find bookings whose end time has passed
    const expiredBookingIds: string[] = [];
    for (const b of todayBookings) {
      const endTime = b.endSlotId ? endSlotTimeMap.get(b.endSlotId) : null;
      if (endTime && endTime <= currentTimeStr) {
        expiredBookingIds.push(b.id);
      }
    }

    if (!expiredBookingIds.length) {
      return NextResponse.json({ freed: 0, message: 'No expired bookings to clean up yet' });
    }

    // Free up the availability rows in DB
    await db
      .update(screenSlotAvailability)
      .set({ status: 'available', bookingId: null })
      .where(inArray(screenSlotAvailability.bookingId, expiredBookingIds));

    // Bust availability cache for today
    await redis.del(`availability:${todayIST}`).catch(() => null);

    return NextResponse.json({
      freed: expiredBookingIds.length,
      message: `Released slots for ${expiredBookingIds.length} expired booking(s)`,
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  }
}
