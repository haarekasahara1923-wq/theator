import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { redis } from '@/lib/redis';
import { screens, timeSlots, screenSlotAvailability, bookings } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    // Check Redis cache first
    const cacheKey = `availability:${date}`;
    const cached = await redis.get(cacheKey).catch(() => null);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Fetch from DB
    const allScreens = await db.select().from(screens).where(eq(screens.isActive, true));
    const allSlots = await db.select().from(timeSlots).orderBy(timeSlots.slotOrder);
    const availability = await db.select().from(screenSlotAvailability)
      .where(eq(screenSlotAvailability.bookingDate, date));

    // Get customer names for booked slots
    const bookedBookings = await db.select({
      id: bookings.id,
      customerName: bookings.customerName,
    }).from(bookings).where(
      and(
        eq(bookings.bookingDate, date),
        eq(bookings.bookingStatus, 'confirmed'),
        eq(bookings.paymentStatus, 'paid'),
      )
    );

    const bookingMap = new Map(bookedBookings.map(b => [b.id, b.customerName]));

    const screenA = allScreens.find(s => s.name === 'Screen A');
    const screenB = allScreens.find(s => s.name === 'Screen B');

    // Build slot matrix
    const slots = allSlots.map(slot => {
      const getStatus = (screenId: string) => {
        const avail = availability.find(
          a => a.screenId === screenId && a.timeSlotId === slot.id
        );

        if (!avail) return { status: 'available' as const, bookingId: undefined, customerName: undefined };

        // Check Redis lock
        return {
          status: avail.status as 'available' | 'booked' | 'locked' | 'blocked',
          bookingId: avail.bookingId ?? undefined,
          customerName: avail.bookingId ? bookingMap.get(avail.bookingId) : undefined,
        };
      };

      const screenAData = screenA ? getStatus(screenA.id) : { status: 'blocked' as const, bookingId: undefined, customerName: undefined };
      const screenBData = screenB ? getStatus(screenB.id) : { status: 'blocked' as const, bookingId: undefined, customerName: undefined };

      return {
        slotId: slot.id,
        slotLabel: slot.slotLabel,
        startTime: slot.startTime,
        endTime: slot.endTime,
        slotOrder: slot.slotOrder,
        screenAStatus: screenAData.status,
        screenBStatus: screenBData.status,
        screenABookingId: screenAData.bookingId,
        screenBBookingId: screenBData.bookingId,
        screenACustomerName: screenAData.customerName,
        screenBCustomerName: screenBData.customerName,
      };
    });

    // Check Redis locks and overlay
    const slotsWithLocks = await Promise.all(
      slots.map(async (slot) => {
        if (screenA && slot.screenAStatus === 'available') {
          const lockKey = `slot_lock:${screenA.id}:${date}:${slot.slotId}`;
          const locked = await redis.get(lockKey).catch(() => null);
          if (locked) slot.screenAStatus = 'locked';
        }
        if (screenB && slot.screenBStatus === 'available') {
          const lockKey = `slot_lock:${screenB.id}:${date}:${slot.slotId}`;
          const locked = await redis.get(lockKey).catch(() => null);
          if (locked) slot.screenBStatus = 'locked';
        }
        return slot;
      })
    );

    const response = {
      date,
      slots: slotsWithLocks,
      screenAId: screenA?.id || '',
      screenBId: screenB?.id || '',
    };

    // Cache for 60 seconds
    await redis.setex(cacheKey, 60, JSON.stringify(response)).catch(() => null);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Availability API error:', error);
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 });
  }
}
