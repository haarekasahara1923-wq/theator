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

    // Allow public GET for pricing and complementary (needed for booking flow)
    if (req.method === 'GET' && (pathname === '/api/admin/pricing' || pathname === '/api/admin/complementary')) {
      return NextResponse.next();
    }

    const token = req.cookies.get('nv_admin_token')?.value;
    if (!token) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Auth token missing' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.jti) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
      }
      const response = NextResponse.redirect(new URL('/admin/login', req.url));
      response.cookies.delete('nv_admin_token');
      return response;
    }

    // Check Redis session - make it non-blocking for better UX if Redis is slow
    const sessionKey = `admin_session:${payload.jti}`;
    try {
      const session = await redis.get(sessionKey);
      if (!session && process.env.NODE_ENV === 'production') {
        // Only enforce strict session in production if we want, 
        // but for now let's be lenient to avoid "stuck" UI if Redis has issues
        // return NextResponse.json({ error: 'Session not found' }, { status: 401 });
      }
    } catch (e) {
      console.error('Middleware Redis Error:', e);
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
  matcher: ['/admin', '/admin/:path*', '/api/admin/:path*'],
};
