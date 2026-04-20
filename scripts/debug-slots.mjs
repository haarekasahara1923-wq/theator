/**
 * Debug script: check what's in screenSlotAvailability for a given date
 * Run: node scripts/debug-slots.mjs 2026-04-20
 */

const REDIS_URL   = 'https://liked-mantis-83121.upstash.io';
const REDIS_TOKEN = 'gQAAAAAAAUSxAAIncDI1NmEzOTZkNmJiM2U0N2QyYmI2MjkwMDEyNzRkNDg1OXAyODMxMjE';
const DB_URL      = 'postgresql://neondb_owner:npg_51iGoknXNjZc@ep-icy-bar-anofuujy-pooler.c-6.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require';

import pg from 'pg';
const { Client } = pg;

const date = process.argv[2] || new Date().toISOString().split('T')[0];
console.log(`\n🔍 Checking slots for date: ${date}\n`);

const client = new Client({ connectionString: DB_URL });
await client.connect();

// Show screenSlotAvailability rows for this date
const { rows: avail } = await client.query(`
  SELECT 
    ssa.id,
    ssa.status,
    ssa.booking_id,
    ssa.booking_date,
    sc.name as screen_name,
    ts.slot_label,
    ts.start_time,
    ts.end_time
  FROM screen_slot_availability ssa
  JOIN screens sc ON sc.id = ssa.screen_id
  JOIN time_slots ts ON ts.id = ssa.time_slot_id
  WHERE ssa.booking_date = $1
  ORDER BY sc.name, ts.slot_order
`, [date]);

console.log(`📋 screenSlotAvailability rows for ${date}:`);
if (avail.length === 0) {
  console.log('   (no rows found - all slots are implicitly available)');
} else {
  avail.forEach(r => {
    const icon = r.status === 'booked' ? '🔴' : r.status === 'available' ? '🟢' : '🟡';
    console.log(`  ${icon} ${r.screen_name} | ${r.slot_label} | status=${r.status} | bookingId=${r.booking_id || 'none'}`);
  });
}

// Show bookings for this date
const { rows: bkgs } = await client.query(`
  SELECT 
    b.id, b.booking_ref, b.booking_status, b.payment_status, b.booking_date,
    b.created_at,
    ts1.slot_label as start_label,
    ts2.slot_label as end_label,
    ts2.end_time as booking_end_time
  FROM bookings b
  LEFT JOIN time_slots ts1 ON ts1.id = b.start_slot_id
  LEFT JOIN time_slots ts2 ON ts2.id = b.end_slot_id
  WHERE b.booking_date = $1
  ORDER BY b.created_at
`, [date]);

console.log(`\n📦 Bookings for ${date}:`);
if (bkgs.length === 0) {
  console.log('   (no bookings)');
} else {
  bkgs.forEach(b => {
    const icon = b.booking_status === 'confirmed' ? '✅' : b.booking_status === 'pending' ? '⏳' : '❌';
    console.log(`  ${icon} ${b.booking_ref} | ${b.booking_status}/${b.payment_status} | ${b.start_label} → ${b.end_label} (ends ${b.booking_end_time}) | created: ${b.created_at}`);
  });
}

await client.end();
