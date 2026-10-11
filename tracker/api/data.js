import { hasSession } from '../lib/auth.js';

const ORIGIN = 'https://fountain-availability-tracker.daniel254762.chatgpt.site';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!hasSession(req)) return res.status(401).json({ error: 'Sign in to view reports' });
  try {
    const login = await fetch(`${ORIGIN}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: process.env.TRACKER_PASSWORD }),
      signal: AbortSignal.timeout(10000)
    });
    if (!login.ok) return res.status(502).json({ error: 'The report source is unavailable' });
    const cookie = login.headers.get('set-cookie')?.split(';')[0];
    if (!cookie) return res.status(502).json({ error: 'The report source did not return a session' });
    const source = await fetch(`${ORIGIN}/api/data`, {
      headers: { Cookie: cookie }, cache: 'no-store', signal: AbortSignal.timeout(10000)
    });
    if (!source.ok) return res.status(502).json({ error: 'The report source is unavailable' });
    const data = await source.json();
    if (!Array.isArray(data.snapshots) || !data.coverage?.providers) throw new Error('Unexpected report shape');
    return res.status(200).json(data);
  } catch {
    return res.status(502).json({ error: 'Could not load report data. Try again shortly.' });
  }
}
