import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { redis } from '@/lib/redis';
import { screenSlotAvailability, screens, timeSlots } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    if (!date) return NextResponse.json({ error: 'Date required' }, { status: 400 });

    const allScreens = await db.select().from(screens).where(eq(screens.isActive, true));
    const allSlots = await db.select().from(timeSlots).orderBy(timeSlots.slotOrder);
    const availability = await db.select()
      .from(screenSlotAvailability)
      .where(eq(screenSlotAvailability.bookingDate, date));

    return NextResponse.json({ screens: allScreens, slots: allSlots, availability, date });
  } catch (error) {
    console.error('Admin slots GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch slots' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { screenId, slotId, date, action } = await req.json();

    if (!screenId || !slotId || !date || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (action === 'block') {
      await db.insert(screenSlotAvailability).values({
        screenId,
        timeSlotId: slotId,
        bookingDate: date,
        status: 'blocked',
      }).onConflictDoUpdate({
        target: [
          screenSlotAvailability.screenId,
          screenSlotAvailability.timeSlotId,
          screenSlotAvailability.bookingDate,
        ],
        set: { status: 'blocked' },
      });
    } else if (action === 'unblock') {
      await db.update(screenSlotAvailability)
        .set({ status: 'available', bookingId: null })
        .where(
          and(
            eq(screenSlotAvailability.screenId, screenId),
            eq(screenSlotAvailability.timeSlotId, slotId),
            eq(screenSlotAvailability.bookingDate, date)
          )
        );
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Invalidate cache
    await redis.del(`availability:${date}`).catch(() => null);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin slots POST error:', error);
    return NextResponse.json({ error: 'Slot action failed' }, { status: 500 });
  }
}
