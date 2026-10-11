import { issueSession, passwordMatches } from '../lib/auth.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.TRACKER_PASSWORD) return res.status(503).json({ error: 'Access is not configured' });
  if (!passwordMatches(req.body?.password)) return res.status(401).json({ error: 'That password did not work' });
  res.setHeader('Set-Cookie', issueSession());
  return res.status(200).json({ ok: true });
}
