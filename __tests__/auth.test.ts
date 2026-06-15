import crypto from 'crypto';

const SESSION_SECRET = 'test_secret_for_jest_1234567890_abcdef';

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, key] = storedHash.split(':');
  if (!salt || !key) return false;
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(Buffer.from(key, 'hex'), derivedKey);
}

interface SessionPayload {
  userId: string;
  email: string;
  userName: string;
  exp: number;
}

function signToken(payload: Omit<SessionPayload, 'exp'>, expiresInDays = 7): string {
  const exp = Math.floor(Date.now() / 1000) + expiresInDays * 24 * 60 * 60;
  const fullPayload: SessionPayload = { ...payload, exp };
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const hmac = crypto.createHmac('sha256', SESSION_SECRET);
  hmac.update(`${header}.${body}`);
  const signature = hmac.digest('base64url');
  return `${header}.${body}.${signature}`;
}

function verifyToken(token: string, secret = SESSION_SECRET): SessionPayload | null {
  try {
    const [header, body, signature] = token.split('.');
    if (!header || !body || !signature) return null;
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${header}.${body}`);
    const validSignature = hmac.digest('base64url');
    if (signature !== validSignature) return null;
    const decodedBody = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8')) as SessionPayload;
    if (decodedBody.exp < Math.floor(Date.now() / 1000)) return null;
    return decodedBody;
  } catch {
    return null;
  }
}

describe('hashPassword()', () => {
  it('returns salt:hash format', () => {
    const hash = hashPassword('mypassword123');
    expect(hash).toContain(':');
    const parts = hash.split(':');
    expect(parts).toHaveLength(2);
    expect(parts[0]).toHaveLength(32);
  });

  it('produces different hashes for same password due to random salt', () => {
    const h1 = hashPassword('samepassword');
    const h2 = hashPassword('samepassword');
    expect(h1).not.toBe(h2);
  });

  it('produces 128-char derived key hex', () => {
    const hash = hashPassword('test');
    expect(hash.split(':')[1]).toHaveLength(128);
  });

  it('handles special characters in password', () => {
    const hash = hashPassword('p@$$w0rd!#%^&*()');
    expect(hash).toContain(':');
  });
});

describe('verifyPassword()', () => {
  it('returns true for correct password', () => {
    const pw = 'correctPassword!';
    const hash = hashPassword(pw);
    expect(verifyPassword(pw, hash)).toBe(true);
  });

  it('returns false for incorrect password', () => {
    const hash = hashPassword('correctPassword!');
    expect(verifyPassword('wrongPassword!', hash)).toBe(false);
  });

  it('returns false for empty password against valid hash', () => {
    const hash = hashPassword('somePassword');
    expect(verifyPassword('', hash)).toBe(false);
  });

  it('returns false for malformed hash without colon', () => {
    expect(verifyPassword('password', 'notahashformat')).toBe(false);
  });

  it('returns false for empty stored hash', () => {
    expect(verifyPassword('password', '')).toBe(false);
  });

  it('is case-sensitive', () => {
    const hash = hashPassword('Password123');
    expect(verifyPassword('password123', hash)).toBe(false);
  });

  it('returns false for hash with only salt part', () => {
    expect(verifyPassword('password', 'onlysalt:')).toBe(false);
  });
});

describe('signToken()', () => {
  const payload = { userId: 'usr_abc123', email: 'test@eco.com', userName: 'EcoUser' };

  it('returns a three-part JWT string', () => {
    const token = signToken(payload);
    expect(token.split('.')).toHaveLength(3);
  });

  it('encodes userId, email, userName in payload', () => {
    const token = signToken(payload);
    const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf-8'));
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.userName).toBe(payload.userName);
  });

  it('includes exp field greater than now', () => {
    const token = signToken(payload);
    const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf-8'));
    expect(decoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  it('custom expiry of 1 day is ~86400s from now', () => {
    const token = signToken(payload, 1);
    const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf-8'));
    expect(decoded.exp).toBeCloseTo(Math.floor(Date.now() / 1000) + 86400, -2);
  });

  it('header specifies HS256 algorithm', () => {
    const token = signToken(payload);
    const header = JSON.parse(Buffer.from(token.split('.')[0], 'base64url').toString('utf-8'));
    expect(header.alg).toBe('HS256');
  });
});

describe('verifyToken()', () => {
  const payload = { userId: 'usr_xyz', email: 'verify@eco.com', userName: 'Verifier' };

  it('returns payload for a valid token', () => {
    const token = signToken(payload);
    const result = verifyToken(token);
    expect(result).not.toBeNull();
    expect(result?.userId).toBe(payload.userId);
    expect(result?.email).toBe(payload.email);
  });

  it('returns null for a tampered body', () => {
    const token = signToken(payload);
    const parts = token.split('.');
    parts[1] = Buffer.from(JSON.stringify({ userId: 'hacker', email: 'hack@er.com', userName: 'Hacker', exp: 9999999999 })).toString('base64url');
    expect(verifyToken(parts.join('.'))).toBeNull();
  });

  it('returns null for an expired token', () => {
    const exp = Math.floor(Date.now() / 1000) - 10;
    const fullPayload = { ...payload, exp };
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
    const hmac = crypto.createHmac('sha256', SESSION_SECRET);
    hmac.update(`${header}.${body}`);
    const sig = hmac.digest('base64url');
    expect(verifyToken(`${header}.${body}.${sig}`)).toBeNull();
  });

  it('returns null for completely invalid string', () => {
    expect(verifyToken('not.a.validtoken')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(verifyToken('')).toBeNull();
  });

  it('returns null if only two parts', () => {
    expect(verifyToken('header.body')).toBeNull();
  });

  it('returns null for wrong secret', () => {
    const token = signToken(payload);
    expect(verifyToken(token, 'wrong_secret')).toBeNull();
  });

  it('returns null for non-JSON body', () => {
    const header = Buffer.from('{}').toString('base64url');
    const body = 'notjson';
    const sig = 'fakesig';
    expect(verifyToken(`${header}.${body}.${sig}`)).toBeNull();
  });
});
