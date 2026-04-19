import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'dummy_secret_for_build_time_only');

export interface AdminPayload {
  adminId: string;
  role: string;
  email: string;
  jti?: string;
}

// Create JWT token
export async function createToken(payload: AdminPayload) {
  const jti = crypto.randomUUID();
  return {
    token: await new SignJWT({ ...payload, jti })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setJti(jti)
      .setExpirationTime('24h')
      .sign(JWT_SECRET),
    jti,
  };
}

// Verify JWT token
export async function verifyToken(token: string): Promise<(AdminPayload & { jti: string }) | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as AdminPayload & { jti: string };
  } catch {
    return null;
  }
}

// Hash password
export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

// Compare password
export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
