import { createHmac, createHash, timingSafeEqual } from 'node:crypto';

export const COOKIE = 'fountain_tracker_session';
const TTL = 12 * 60 * 60 * 1000;

function digest(value, secret) {
  return createHmac('sha256', secret).update(value).digest('hex');
}

function equal(a, b) {
  const left = Buffer.from(a || '');
  const right = Buffer.from(b || '');
  return left.length === right.length && timingSafeEqual(left, right);
}

export function passwordMatches(input) {
  const password = process.env.TRACKER_PASSWORD;
  if (!password || typeof input !== 'string') return false;
  return equal(createHash('sha256').update(input).digest('hex'), createHash('sha256').update(password).digest('hex'));
}

export function issueSession() {
  const expiry = String(Date.now() + TTL);
  const payload = `v1.${expiry}`;
  const token = `${payload}.${digest(payload, process.env.TRACKER_PASSWORD)}`;
  return `${COOKIE}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=43200`;
}

export function hasSession(req) {
  const secret = process.env.TRACKER_PASSWORD;
  if (!secret) return false;
  const cookie = (req.headers.cookie || '').split(';').map(x => x.trim()).find(x => x.startsWith(`${COOKIE}=`));
  if (!cookie) return false;
  const match = /^v1\.(\d+)\.([a-f0-9]{64})$/.exec(cookie.slice(COOKIE.length + 1));
  if (!match || Number(match[1]) < Date.now()) return false;
  return equal(match[2], digest(`v1.${match[1]}`, secret));
}

export const logoutCookie = `${COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
