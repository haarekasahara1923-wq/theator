import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { redis } from '@/lib/redis';
import { screens, timeSlots, screenSlotAvailability, bookings } from '@/lib/schema';
import { eq, and, inArray } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    // IST-aware "now"
    const now = new Date();
    const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    const todayIST = istTime.toISOString().split('T')[0];   // "YYYY-MM-DD"
    const currentTimeStr = istTime.toISOString().split('T')[1].slice(0, 5); // "HH:MM"

    // ── Past date shortcut ────────────────────────────────────────────────
    // If the requested date is strictly before today, ALL slots are done.
    if (date < todayIST) {
      const allScreens = await db.select().from(screens).where(eq(screens.isActive, true));
      const allSlots  = await db.select().from(timeSlots).orderBy(timeSlots.slotOrder);
      const screenA   = allScreens.find(s => s.name === 'Screen A');
      const screenB   = allScreens.find(s => s.name === 'Screen B');

      const slots = allSlots.map(slot => ({
        slotId:              slot.id,
        slotLabel:           slot.slotLabel,
        startTime:           slot.startTime,
        endTime:             slot.endTime,
        slotOrder:           slot.slotOrder,
        screenAStatus:       'available' as const,
        screenBStatus:       'available' as const,
        screenABookingId:    undefined,
        screenBBookingId:    undefined,
        screenACustomerName: undefined,
        screenBCustomerName: undefined,
      }));

      return NextResponse.json({
        date,
        slots,
        screenAId: screenA?.id || '',
        screenBId: screenB?.id || '',
      });
    }

    // ── Check Redis cache ─────────────────────────────────────────────────
    const cacheKey = `availability:${date}`;
    const cached   = await redis.get(cacheKey).catch(() => null);
    if (cached) {
      return NextResponse.json(cached);
    }

    // ── Fetch from DB ─────────────────────────────────────────────────────
    const allScreens   = await db.select().from(screens).where(eq(screens.isActive, true));
    const allSlots     = await db.select().from(timeSlots).orderBy(timeSlots.slotOrder);
    const availability = await db.select().from(screenSlotAvailability)
      .where(eq(screenSlotAvailability.bookingDate, date));

    // ── Load all confirmed bookings for this date, with their END slot time
    //    so we can properly check if a multi-slot booking is fully over.
    const confirmedBookings = await db
      .select({
        id:            bookings.id,
        customerName:  bookings.customerName,
        endSlotId:     bookings.endSlotId,
      })
      .from(bookings)
      .where(
        and(
          eq(bookings.bookingDate, date),
          eq(bookings.bookingStatus, 'confirmed'),
          eq(bookings.paymentStatus, 'paid'),
        )
      );

    // Fetch end-slot endTime for every confirmed booking
    const endSlotIds = confirmedBookings
      .map(b => b.endSlotId)
      .filter((id): id is string => !!id);

    const endSlotsData = endSlotIds.length
      ? await db.select({ id: timeSlots.id, endTime: timeSlots.endTime })
          .from(timeSlots)
          .where(inArray(timeSlots.id, endSlotIds))
      : [];

    const endSlotTimeMap = new Map(endSlotsData.map(s => [s.id, s.endTime]));

    // Map: bookingId → { customerName, bookingEndTime }
    const bookingInfoMap = new Map(
      confirmedBookings.map(b => [
        b.id,
        {
          customerName:    b.customerName,
          bookingEndTime:  b.endSlotId ? endSlotTimeMap.get(b.endSlotId) ?? null : null,
        },
      ])
    );

    const screenA = allScreens.find(s => s.name === 'Screen A');
    const screenB = allScreens.find(s => s.name === 'Screen B');

    // ── Build slot matrix ─────────────────────────────────────────────────
    const slots = allSlots.map(slot => {
      const getStatus = (screenId: string) => {
        const avail = availability.find(
          a => a.screenId === screenId && a.timeSlotId === slot.id
        );

        if (!avail || avail.status === 'available') {
          return { status: 'available' as const, bookingId: undefined, customerName: undefined };
        }

        // For a BOOKED slot on TODAY — check if the booking's end time has passed.
        // We check the BOOKING's endSlot endTime (not this individual slot's endTime),
        // so all slots in a multi-slot booking release together when the LAST slot is over.
        if (date === todayIST && avail.status === 'booked' && avail.bookingId) {
          const info = bookingInfoMap.get(avail.bookingId);
          const bookingEnd = info?.bookingEndTime ?? slot.endTime; // fallback to slot's own endTime
          if (bookingEnd <= currentTimeStr) {
            // Booking time is over — treat as available
            return { status: 'available' as const, bookingId: undefined, customerName: undefined };
          }
        }

        return {
          status: avail.status as 'available' | 'booked' | 'locked' | 'blocked',
          bookingId:    avail.bookingId ?? undefined,
          customerName: avail.bookingId
            ? bookingInfoMap.get(avail.bookingId)?.customerName
            : undefined,
        };
      };

      const screenAData = screenA
        ? getStatus(screenA.id)
        : { status: 'blocked' as const, bookingId: undefined, customerName: undefined };
      const screenBData = screenB
        ? getStatus(screenB.id)
        : { status: 'blocked' as const, bookingId: undefined, customerName: undefined };

      return {
        slotId:              slot.id,
        slotLabel:           slot.slotLabel,
        startTime:           slot.startTime,
        endTime:             slot.endTime,
        slotOrder:           slot.slotOrder,
        screenAStatus:       screenAData.status,
        screenBStatus:       screenBData.status,
        screenABookingId:    screenAData.bookingId,
        screenBBookingId:    screenBData.bookingId,
        screenACustomerName: screenAData.customerName,
        screenBCustomerName: screenBData.customerName,
      };
    });

    // ── Overlay Redis locks ───────────────────────────────────────────────
    const slotsWithLocks = await Promise.all(
      slots.map(async (slot) => {
        if (screenA && slot.screenAStatus === 'available') {
          const lockKey = `slot_lock:${screenA.id}:${date}:${slot.slotId}`;
          const locked  = await redis.get(lockKey).catch(() => null);
          if (locked) slot.screenAStatus = 'locked';
        }
        if (screenB && slot.screenBStatus === 'available') {
          const lockKey = `slot_lock:${screenB.id}:${date}:${slot.slotId}`;
          const locked  = await redis.get(lockKey).catch(() => null);
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

    // Cache for 30 seconds (short TTL so expired slots refresh quickly)
    await redis.setex(cacheKey, 30, JSON.stringify(response)).catch(() => null);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Availability API error:', error);
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 });
  }
}
