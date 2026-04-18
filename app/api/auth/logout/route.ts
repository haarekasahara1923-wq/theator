import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { verifyToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('nv_admin_token')?.value;

    if (token) {
      const payload = await verifyToken(token);
      if (payload?.jti) {
        await redis.del(`admin_session:${payload.jti}`).catch(() => null);
      }
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set('nv_admin_token', '', {
      httpOnly: true,
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
