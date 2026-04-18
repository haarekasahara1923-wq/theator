import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { redis } from '@/lib/redis';
import { bookings, screens } from '@/lib/schema';
import { and, eq, gte, lte, sum, count, sql } from 'drizzle-orm';
import { format, startOfMonth, endOfMonth } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    const today = format(new Date(), 'yyyy-MM-dd');
    const statsKey = `admin_stats:${today}`;

    // Check cache
    const cached = await redis.get(statsKey).catch(() => null);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Today's stats
    const todayBookings = await db
      .select({ count: count(), revenue: sum(bookings.totalAmount) })
      .from(bookings)
      .where(
        and(
          eq(bookings.bookingDate, today),
          eq(bookings.bookingStatus, 'confirmed'),
          eq(bookings.paymentStatus, 'paid')
        )
      );

    // Month stats
    const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd');
    const monthEnd = format(endOfMonth(new Date()), 'yyyy-MM-dd');
    const monthBookings = await db
      .select({ count: count(), revenue: sum(bookings.totalAmount) })
      .from(bookings)
      .where(
        and(
          gte(bookings.bookingDate, monthStart),
          lte(bookings.bookingDate, monthEnd),
          eq(bookings.bookingStatus, 'confirmed'),
          eq(bookings.paymentStatus, 'paid')
        )
      );

    // Available slots today (13 slots x 2 screens = 26 max)
    const bookedSlotsToday = await db
      .select({ count: count() })
      .from(bookings)
      .where(
        and(
          eq(bookings.bookingDate, today),
          eq(bookings.bookingStatus, 'confirmed'),
          eq(bookings.paymentStatus, 'paid')
        )
      );

    const stats = {
      totalBookingsToday: Number(todayBookings[0]?.count || 0),
      revenueToday: Number(todayBookings[0]?.revenue || 0),
      availableSlotsToday: Math.max(0, 26 - Number(bookedSlotsToday[0]?.count || 0)),
      totalRevenueThisMonth: Number(monthBookings[0]?.revenue || 0),
      totalBookingsThisMonth: Number(monthBookings[0]?.count || 0),
    };

    // Cache 5 minutes
    await redis.setex(statsKey, 300, JSON.stringify(stats)).catch(() => null);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
