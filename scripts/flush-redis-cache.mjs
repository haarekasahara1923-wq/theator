/**
 * Run once to flush stale Redis availability cache keys.
 * Usage: node scripts/flush-redis-cache.mjs
 */

const REDIS_URL   = process.env.UPSTASH_REDIS_REST_URL   || 'https://liked-mantis-83121.upstash.io';
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || 'gQAAAAAAAUSxAAIncDI1NmEzOTZkNmJiM2U0N2QyYmI2MjkwMDEyNzRkNDg1OXAyODMxMjE';

async function redisCmd(...args) {
  const res = await fetch(`${REDIS_URL}/${args.join('/')}`, {
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
  });
  return res.json();
}

// Build list of date keys to flush (last 7 days)
const datesToFlush = [];
const now = new Date();
for (let i = 0; i <= 7; i++) {
  const d = new Date(now);
  d.setDate(d.getDate() - i);
  const iso = d.toISOString().split('T')[0];
  datesToFlush.push(`availability:${iso}`);
}

console.log('Flushing keys:', datesToFlush);

for (const key of datesToFlush) {
  const result = await redisCmd('DEL', key);
  console.log(`DEL ${key}:`, result);
}

console.log('Done. Redis availability cache cleared for last 7 days.');
