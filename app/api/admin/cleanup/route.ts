import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { redis } from '@/lib/redis';
import { bookings, screenSlotAvailability, timeSlots } from '@/lib/schema';
import { eq, and, inArray, lt } from 'drizzle-orm';

/**
 * POST /api/admin/cleanup
 *
 * Three-phase cleanup (safe + idempotent):
 *  Phase 1 – Past dates : free ALL booked screenSlotAvailability rows for dates < today
 *  Phase 2 – Today      : free slots whose booking end-time has passed (IST)
 *  Phase 3 – Pending    : mark unpaid bookings older than 5 min as 'expired'
 */
export async function POST(_req: NextRequest) {
  try {
    const now = new Date();
    const istTime        = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
    const todayIST       = istTime.toISOString().split('T')[0]; // YYYY-MM-DD
    const currentTimeStr = istTime.toISOString().split('T')[1].slice(0, 5); // HH:MM

    let totalFreedSlots = 0;
    const log: string[] = [];

    // ── Phase 1 & 2: Free expired booking slots ──────────────────────────
    // Fetch ALL confirmed+paid bookings (across all dates)
    const allConfirmed = await db
      .select({ id: bookings.id, bookingDate: bookings.bookingDate, endSlotId: bookings.endSlotId })
      .from(bookings)
      .where(and(eq(bookings.bookingStatus, 'confirmed'), eq(bookings.paymentStatus, 'paid')));

    // Fetch end-slot endTimes for today's bookings
    const todayEndSlotIds = allConfirmed
      .filter(b => b.bookingDate === todayIST)
      .map(b => b.endSlotId)
      .filter((id): id is string => !!id);

    const endSlotsData = todayEndSlotIds.length
      ? await db
          .select({ id: timeSlots.id, endTime: timeSlots.endTime })
          .from(timeSlots)
          .where(inArray(timeSlots.id, todayEndSlotIds))
      : [];
    const endSlotTimeMap = new Map(endSlotsData.map(s => [s.id, s.endTime]));

    // Determine which booking IDs should have their slots freed
    const bookingIdsToFree: string[]   = [];
    const affectedDates: Set<string>   = new Set();

    for (const b of allConfirmed) {
      if (b.bookingDate < todayIST) {
        // Past date — always free
        bookingIdsToFree.push(b.id);
        affectedDates.add(b.bookingDate);
      } else if (b.bookingDate === todayIST) {
        // Today — free only if end-time has passed
        const endTime = b.endSlotId ? endSlotTimeMap.get(b.endSlotId) : null;
        if (endTime && endTime <= currentTimeStr) {
          bookingIdsToFree.push(b.id);
          affectedDates.add(todayIST);
        }
      }
      // Future bookings: untouched
    }

    if (bookingIdsToFree.length > 0) {
      // Only update rows that are still 'booked' (idempotent)
      await db
        .update(screenSlotAvailability)
        .set({ status: 'available', bookingId: null })
        .where(
          and(
            inArray(screenSlotAvailability.bookingId, bookingIdsToFree),
            eq(screenSlotAvailability.status, 'booked'),
          )
        );

      totalFreedSlots = bookingIdsToFree.length;
      log.push(`Phase 1+2: freed slots for ${bookingIdsToFree.length} booking(s) | dates: ${[...affectedDates].join(', ')}`);

      // Bust Redis cache for all affected dates
      for (const d of affectedDates) {
        await redis.del(`availability:${d}`).catch(() => null);
      }
    } else {
      log.push('Phase 1+2: no expired bookings to free');
    }

    // ── Phase 3: Expire pending (unpaid) bookings older than 5 minutes ──
    const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);

    const expiredPending = await db
      .update(bookings)
      .set({ bookingStatus: 'expired', paymentStatus: 'failed' })
      .where(
        and(
          eq(bookings.bookingStatus, 'pending'),
          lt(bookings.createdAt, fiveMinAgo),
        )
      )
      .returning({ id: bookings.id });

    if (expiredPending.length > 0) {
      log.push(`Phase 3: marked ${expiredPending.length} abandoned pending booking(s) as expired`);
    } else {
      log.push('Phase 3: no pending bookings to expire');
    }

    return NextResponse.json({
      success: true,
      freedSlots: totalFreedSlots,
      expiredPendingBookings: expiredPending.length,
      log,
      timestamp: istTime.toISOString(),
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  }
}
