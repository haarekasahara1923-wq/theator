import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { redis } from '@/lib/redis';
import { bookings, screenSlotAvailability, screens, timeSlots } from '@/lib/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingData,
      lockKeys,
    } = await req.json();

    // 1. Verify HMAC SHA256 signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    // 2. Generate booking reference
    const screenName = bookingData.screenName;
    const screenLetter = screenName.includes('A') ? 'A' : 'B';
    const today = bookingData.bookingDate.replace(/-/g, '');
    const countKey = `booking_seq:${today}:${screenLetter}`;
    const seq = await redis.incr(countKey);
    await redis.expire(countKey, 86400 * 2);
    const bookingRef = `NVT-${today}-${screenLetter}-${String(seq).padStart(3, '0')}`;

    // 3. Update existing booking in DB
    const [booking] = await db.update(bookings).set({
      bookingRef,
      paymentStatus: 'paid',
      razorpayPaymentId: razorpay_payment_id,
      bookingStatus: 'confirmed',
    }).where(eq(bookings.razorpayOrderId, razorpay_order_id))
    .returning();

    if (!booking) {
      return NextResponse.json({ error: 'Original booking not found' }, { status: 404 });
    }

    // 4. Update slot availability - mark all slots in range as booked
    const allSlots = await db.select().from(timeSlots)
      .where(
        and(
          gte(timeSlots.slotOrder, bookingData.startSlotOrder),
          lte(timeSlots.slotOrder, bookingData.endSlotOrder - 1) // end slot is exclusive
        )
      );

    for (const slot of allSlots) {
      // Upsert availability record
      await db.insert(screenSlotAvailability).values({
        screenId: bookingData.screenId,
        timeSlotId: slot.id,
        bookingDate: bookingData.bookingDate,
        status: 'booked',
        bookingId: booking.id,
      }).onConflictDoUpdate({
        target: [
          screenSlotAvailability.screenId,
          screenSlotAvailability.timeSlotId,
          screenSlotAvailability.bookingDate,
        ],
        set: {
          status: 'booked',
          bookingId: booking.id,
        },
      });
    }

    // 5. Delete Redis locks
    if (lockKeys?.length) {
      await redis.del(...lockKeys).catch(() => null);
    }

    // 6. Invalidate availability cache
    await redis.del(`availability:${bookingData.bookingDate}`).catch(() => null);

    // 7. Trigger notifications async (fire and forget)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    fetch(`${baseUrl}/api/notify/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: booking.id, bookingRef, ...bookingData }),
    }).catch(console.error);

    fetch(`${baseUrl}/api/notify/whatsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: booking.id, bookingRef, ...bookingData }),
    }).catch(console.error);

    return NextResponse.json({ success: true, bookingRef, bookingId: booking.id });
  } catch (error) {
    console.error('Payment verify error:', error);
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}
