import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { redis } from '@/lib/redis';
import { admins } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { comparePassword, createToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    // Find admin
    const [admin] = await db.select().from(admins)
      .where(eq(admins.email, email.toLowerCase())).limit(1);

    if (!admin || !admin.isActive) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Compare password
    const valid = await comparePassword(password, admin.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Create JWT
    const { token, jti } = await createToken({
      adminId: admin.id,
      role: admin.role,
      email: admin.email,
    });

    // Store session in Redis
    await redis.setex(
      `admin_session:${jti}`,
      86400,
      JSON.stringify({ adminId: admin.id, role: admin.role, email: admin.email })
    );

    // Set HttpOnly cookie
    const response = NextResponse.json({
      admin: { name: admin.name, role: admin.role, email: admin.email },
      redirectTo: '/admin/dashboard',
    });

    response.cookies.set('nv_admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
