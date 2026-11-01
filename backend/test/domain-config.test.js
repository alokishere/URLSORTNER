const test = require('node:test');
const assert = require('node:assert/strict');
const { getConfig } = require('../config/env');

test('production origins normalize and reject unsafe configuration', t => {
  for (const [key, value] of Object.entries({ NODE_ENV: 'production', FRONTEND_URL: 'https://url.alokdev.in/', BACKEND_URL: 'https://u.alokdev.in/', API_BASE_URL: 'https://u.alokdev.in', CORS_ORIGINS: 'https://ekurl.vercel.app/' })) {
    const previous = process.env[key]; process.env[key] = value;
    t.after(() => previous === undefined ? delete process.env[key] : process.env[key] = previous);
  }
  assert.equal(getConfig().backendUrl, 'https://u.alokdev.in');
  assert.deepEqual(getConfig().corsOrigins, ['https://url.alokdev.in', 'https://ekurl.vercel.app']);
  process.env.CORS_ORIGINS = 'http://localhost:5173';
  assert.throws(getConfig);
  process.env.CORS_ORIGINS = '';
  process.env.FRONTEND_URL = 'https://app.ekurl.in';
  assert.throws(getConfig);
  process.env.FRONTEND_URL = '';
  assert.throws(getConfig);
});

test('production preflights and root redirect use configured origins without a database', async t => {
  const values = { NODE_ENV: 'production', FRONTEND_URL: 'https://url.alokdev.in', BACKEND_URL: 'https://u.alokdev.in', API_BASE_URL: 'https://u.alokdev.in', CORS_ORIGINS: 'https://ekurl.vercel.app', MONGO_URI: 'mongodb://127.0.0.1/test', JWT_SECRET: 'test-only' };
  for (const [key,value] of Object.entries(values)) {
    const previous = process.env[key]; process.env[key] = value;
    t.after(() => previous === undefined ? delete process.env[key] : process.env[key] = previous);
  }
  const app = require('../index');
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  for (const origin of ['https://url.alokdev.in', 'https://ekurl.vercel.app']) {
    const response = await fetch(base + '/user/login', { method: 'OPTIONS', headers: { Origin: origin, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type,authorization' } });
    assert.equal(response.status, 204);
    assert.equal(response.headers.get('access-control-allow-origin'), origin);
    assert.equal(response.headers.get('access-control-allow-credentials'), 'true');
    assert.match(response.headers.get('access-control-allow-methods'), /PATCH/);
    assert.equal(response.headers.get('location'), null);
  }
  const denied = await fetch(base + '/user/login', { method: 'POST', headers: { Origin: 'http://localhost:5173' } });
  assert.equal(denied.status, 403);
  const root = await fetch(base, { redirect: 'manual' });
  assert.equal(root.headers.get('location'), values.FRONTEND_URL);
  assert.equal(root.headers.get('x-robots-tag'), 'noindex, nofollow');
});
