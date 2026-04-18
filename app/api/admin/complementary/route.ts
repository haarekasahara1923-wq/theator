import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { complementaryItems } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import cloudinary from '@/lib/cloudinary';

export async function GET() {
  try {
    const items = await db.select().from(complementaryItems).orderBy(complementaryItems.createdAt);
    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const role = req.headers.get('x-admin-role');
    if (role !== 'super_admin') {
      return NextResponse.json({ error: 'Super admin only' }, { status: 403 });
    }

    const body = await req.json();
    const { name, category, quantityPerBooking, imageUrl, imagePublicId } = body;

    const [item] = await db.insert(complementaryItems).values({
      name,
      category,
      quantityPerBooking: quantityPerBooking || 1,
      imageUrl,
      imagePublicId,
    }).returning();

    return NextResponse.json({ item });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const role = req.headers.get('x-admin-role');
    if (role !== 'super_admin') {
      return NextResponse.json({ error: 'Super admin only' }, { status: 403 });
    }

    const { id, ...updates } = await req.json();
    await db.update(complementaryItems).set(updates).where(eq(complementaryItems.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const role = req.headers.get('x-admin-role');
    if (role !== 'super_admin') {
      return NextResponse.json({ error: 'Super admin only' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const [item] = await db.select().from(complementaryItems)
      .where(eq(complementaryItems.id, id)).limit(1);

    if (item?.imagePublicId) {
      await cloudinary.uploader.destroy(item.imagePublicId).catch(console.error);
    }

    await db.delete(complementaryItems).where(eq(complementaryItems.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
