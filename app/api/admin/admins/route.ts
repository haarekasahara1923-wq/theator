import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { admins } from '@/lib/schema';
import { eq, count } from 'drizzle-orm';
import { hashPassword } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const role = req.headers.get('x-admin-role');
    if (role !== 'super_admin') {
      return NextResponse.json({ error: 'Super admin only' }, { status: 403 });
    }

    const allAdmins = await db.select({
      id: admins.id,
      name: admins.name,
      email: admins.email,
      role: admins.role,
      isActive: admins.isActive,
      createdAt: admins.createdAt,
    }).from(admins).orderBy(admins.createdAt);

    return NextResponse.json({ admins: allAdmins });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch admins' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const role = req.headers.get('x-admin-role');
    if (role !== 'super_admin') {
      return NextResponse.json({ error: 'Super admin only' }, { status: 403 });
    }

    // Enforce max 2 admins
    const [{ total }] = await db.select({ total: count() }).from(admins).where(eq(admins.isActive, true));
    if (Number(total) >= 2) {
      return NextResponse.json({ error: 'Maximum 2 admins allowed' }, { status: 400 });
    }

    const { name, email, password, adminRole } = await req.json();
    const passwordHash = await hashPassword(password);

    const [newAdmin] = await db.insert(admins).values({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: adminRole || 'admin',
    }).returning({ id: admins.id, name: admins.name, email: admins.email, role: admins.role });

    return NextResponse.json({ admin: newAdmin });
  } catch (error: unknown) {
    if ((error as { code?: string })?.code === '23505') {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create admin' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const role = req.headers.get('x-admin-role');
    const currentAdminId = req.headers.get('x-admin-id');
    if (role !== 'super_admin') {
      return NextResponse.json({ error: 'Super admin only' }, { status: 403 });
    }

    const { id, isActive } = await req.json();

    // Cannot deactivate yourself
    if (id === currentAdminId) {
      return NextResponse.json({ error: 'Cannot modify your own account' }, { status: 400 });
    }

    await db.update(admins).set({ isActive }).where(eq(admins.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
