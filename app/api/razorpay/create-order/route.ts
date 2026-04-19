import { razorpay } from '@/lib/razorpay';
import { redis } from '@/lib/redis';
import { db } from '@/lib/db';
import { bookings } from '@/lib/schema';

export async function POST(req: NextRequest) {
  try {
    const { amount, bookingData, slotIds, screenId, date } = await req.json();

    if (!amount || !bookingData) {
      return NextResponse.json({ error: 'Amount and booking data required' }, { status: 400 });
    }

    // Rate limiting by mobile
    const mobile = bookingData.customerMobile;
    const rateLimitKey = `rate_limit:booking:${mobile}`;
    const attempts = await redis.incr(rateLimitKey).catch(() => 1);
    if (attempts === 1) {
      await redis.expire(rateLimitKey, 3600).catch(() => null);
    }
    if (attempts > 5) {
      return NextResponse.json(
        { error: 'Too many booking attempts. Try again after 1 hour.' },
        { status: 429 }
      );
    }

    // Acquire Redis slot locks
    const sessionId = crypto.randomUUID();
    const lockKeys: string[] = [];
    const failedLocks: string[] = [];

    for (const slotId of slotIds) {
      const lockKey = `slot_lock:${screenId}:${date}:${slotId}`;
      const locked = await redis.set(lockKey, sessionId, { nx: true, ex: 600 }).catch(() => null);
      if (!locked) {
        failedLocks.push(slotId);
      } else {
        lockKeys.push(lockKey);
      }
    }

    if (failedLocks.length > 0) {
      // Release any acquired locks
      for (const key of lockKeys) {
        await redis.del(key).catch(() => null);
      }
      return NextResponse.json(
        { error: 'Slot just booked by another user. Please choose another slot.' },
        { status: 409 }
      );
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amount * 100, // paise
      currency: 'INR',
      receipt: `NVT-${Date.now()}`,
      notes: {
        customer_name: bookingData.customerName,
        mobile: bookingData.customerMobile,
        screen: bookingData.screenName,
        date: bookingData.bookingDate,
      },
    });

    // Generate a temporary booking ref
    const tempRef = `TEMP-${Date.now()}-${bookingData.customerMobile.slice(-4)}`;

    // Insert pending booking for tracking and manual confirmations
    await db.insert(bookings).values({
      bookingRef: tempRef,
      screenId: screenId,
      bookingDate: date,
      startSlotId: bookingData.startSlotId,
      endSlotId: bookingData.endSlotId,
      totalHours: bookingData.totalHours,
      partyType: bookingData.partyType,
      personsCount: bookingData.personsCount,
      customerName: bookingData.customerName,
      customerMobile: bookingData.customerMobile,
      customerEmail: bookingData.customerEmail || null,
      specialRequests: bookingData.specialRequests || null,
      amountPerHour: bookingData.amountPerHour,
      totalAmount: amount,
      paymentStatus: 'pending',
      bookingStatus: 'pending',
      razorpayOrderId: order.id,
      complementaryItems: bookingData.complementaryItems || null,
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      lockKeys,
      sessionId,
    });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
