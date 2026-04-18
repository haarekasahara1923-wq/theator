import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { bookings } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { sendBookingConfirmationEmail } from '@/lib/resend';
import { formatDate } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { bookingId, bookingRef, customerEmail, customerName } = data;

    if (!customerEmail) {
      return NextResponse.json({ success: false, message: 'No email provided' });
    }

    const emailResult = await sendBookingConfirmationEmail({
      bookingRef,
      customerName,
      customerEmail,
      bookingDate: formatDate(data.bookingDate),
      screenName: data.screenName,
      startTime: data.startSlotLabel?.split('–')[0]?.trim() || data.startTime,
      endTime: data.endSlotLabel?.split('–')[1]?.trim() || data.endTime,
      totalHours: data.totalHours,
      partyType: data.partyType,
      personsCount: data.personsCount,
      complementaryList: data.complementaryItems
        ?.map((i: { name: string; quantity: number }) => `${i.name} ×${i.quantity}`)
        .join(', ') || '',
      totalAmount: data.totalAmount,
    });

    // Update emailSent flag
    if (emailResult.success && bookingId) {
      await db.update(bookings)
        .set({ emailSent: true })
        .where(eq(bookings.id, bookingId))
        .catch(() => null);
    }

    return NextResponse.json({ success: emailResult.success });
  } catch (error) {
    console.error('Email notify error:', error);
    return NextResponse.json({ error: 'Email send failed' }, { status: 500 });
  }
}
