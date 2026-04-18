import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect admin routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    // Allow login page
    if (pathname === '/admin/login') return NextResponse.next();

    const token = req.cookies.get('nv_admin_token')?.value;
    if (!token) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.jti) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }

    // Check Redis session still valid
    try {
      const session = await redis.get(`admin_session:${payload.jti}`);
      if (!session) {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json({ error: 'Session expired' }, { status: 401 });
        }
        return NextResponse.redirect(new URL('/admin/login', req.url));
      }
    } catch {
      // If Redis is down, allow through (fallback to JWT only)
      console.error('Redis session check failed');
    }

    // Inject role into headers
    const headers = new Headers(req.headers);
    headers.set('x-admin-role', payload.role as string);
    headers.set('x-admin-id', payload.adminId as string);
    headers.set('x-admin-email', payload.email as string);
    return NextResponse.next({ request: { headers } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
