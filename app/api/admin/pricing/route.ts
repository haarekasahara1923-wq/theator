import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pricingConfig } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const pricing = await db.select().from(pricingConfig).orderBy(pricingConfig.personsMin);
    return NextResponse.json({ pricing });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch pricing' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const role = req.headers.get('x-admin-role');
    if (role !== 'super_admin') {
      return NextResponse.json({ error: 'Super admin only' }, { status: 403 });
    }

    const { updates } = await req.json();
    // updates: [{ id, pricePerHour }]
    for (const update of updates) {
      await db.update(pricingConfig)
        .set({ pricePerHour: update.pricePerHour, updatedAt: new Date() })
        .where(eq(pricingConfig.id, update.id));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
