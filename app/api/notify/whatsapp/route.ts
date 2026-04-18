import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { bookings } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { sendWhatsAppNotification } from '@/lib/whatsapp';
import { formatDate, getPartyTypeLabel } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { bookingId, bookingRef, customerName, customerMobile } = data;

    const result = await sendWhatsAppNotification({
      customerName,
      customerMobile,
      bookingDate: formatDate(data.bookingDate),
      screenName: data.screenName,
      timeRange: `${data.startSlotLabel?.split('–')[0]?.trim()} – ${data.endSlotLabel?.split('–')[1]?.trim()}`,
      partyTypeLabel: getPartyTypeLabel(data.partyType),
      totalAmount: data.totalAmount,
      bookingRef,
    });

    // Update whatsappSent flag
    if (result.success && bookingId) {
      await db.update(bookings)
        .set({ whatsappSent: true })
        .where(eq(bookings.id, bookingId))
        .catch(() => null);
    }

    return NextResponse.json({ success: result.success });
  } catch (error) {
    console.error('WhatsApp notify error:', error);
    return NextResponse.json({ error: 'WhatsApp send failed' }, { status: 500 });
  }
}
