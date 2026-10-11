import test from 'node:test';
import assert from 'node:assert/strict';
import { passwordMatches, issueSession, hasSession, logoutCookie } from '../lib/auth.js';
import login from '../api/login.js';
import data from '../api/data.js';

function response() {
  return { statusCode: 200, headers: {}, body: null,
    setHeader(key, value) { this.headers[key] = value; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; }
  };
}

test('password and signed session gate the report route', async () => {
  process.env.TRACKER_PASSWORD = 'test-only-password';
  assert.equal(passwordMatches('wrong'), false);
  assert.equal(passwordMatches('test-only-password'), true);
  const bad = response();
  await login({method:'POST',body:{password:'wrong'}}, bad);
  assert.equal(bad.statusCode, 401);
  const good = response();
  await login({method:'POST',body:{password:'test-only-password'}}, good);
  assert.equal(good.statusCode, 200);
  const cookie = good.headers['Set-Cookie'].split(';')[0];
  assert.equal(hasSession({headers:{cookie}}), true);
  const altered = cookie.slice(0,-1) + (cookie.endsWith('0') ? '1' : '0');
  assert.equal(hasSession({headers:{cookie:altered}}), false);
  assert.match(logoutCookie, /Max-Age=0/);
  const blocked = response();
  await data({method:'GET',headers:{}}, blocked);
  assert.equal(blocked.statusCode, 401);
  delete process.env.TRACKER_PASSWORD;
});
