import { logoutCookie } from '../lib/auth.js';

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Set-Cookie', logoutCookie);
  return res.status(200).json({ ok: true });
}
