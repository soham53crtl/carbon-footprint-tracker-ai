import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

const SESSION_SECRET = process.env.SESSION_SECRET || 'fallback_secret_for_dev_mode_only_1234567890';
const COOKIE_NAME = 'ecosphere_session';

// Password Hashing
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  // scrypt key derivation
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, key] = storedHash.split(':');
  if (!salt || !key) return false;
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(Buffer.from(key, 'hex'), derivedKey);
}

// Session JWT-like signature verification (HMAC SHA256)
interface SessionPayload {
  userId: string;
  email: string;
  userName: string;
  exp: number;
}

export function signToken(payload: Omit<SessionPayload, 'exp'>, expiresInDays = 7): string {
  const exp = Math.floor(Date.now() / 1000) + expiresInDays * 24 * 60 * 60;
  const fullPayload: SessionPayload = { ...payload, exp };
  
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  
  const hmac = crypto.createHmac('sha256', SESSION_SECRET);
  hmac.update(`${header}.${body}`);
  const signature = hmac.digest('base64url');
  
  return `${header}.${body}.${signature}`;
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    const [header, body, signature] = token.split('.');
    if (!header || !body || !signature) return null;
    
    // Validate signature
    const hmac = crypto.createHmac('sha256', SESSION_SECRET);
    hmac.update(`${header}.${body}`);
    const validSignature = hmac.digest('base64url');
    
    if (signature !== validSignature) {
      return null;
    }
    
    // Parse body
    const decodedBody = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8')) as SessionPayload;
    
    // Check expiration
    if (decodedBody.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    
    return decodedBody;
  } catch (error) {
    return null;
  }
}

// Cookie Helpers for Server API
export function setSessionCookie(response: NextResponse, userId: string, email: string, userName: string) {
  const token = signToken({ userId, email, userName });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });
}

export function getSessionUser(request: NextRequest): SessionPayload | null {
  // 1. Try Authorization header (Bearer token — used by the Next.js frontend)
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    return verifyToken(token);
  }

  // 2. Fall back to httpOnly cookie (legacy / SSR flows)
  const cookie = request.cookies.get(COOKIE_NAME);
  if (!cookie) return null;
  return verifyToken(cookie.value);
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.delete(COOKIE_NAME);
}

