require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
const bcrypt = require('bcryptjs');

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function createSuperAdmin() {
  try {
    const email = 'superadmin@nvtheatre.in';
    const password = 'supersecurepassword123'; // CHANGE THIS
    
    // Hash password just like lib/auth.ts does
    const passwordHash = await bcrypt.hash(password, 12);
    
    await sql`
      INSERT INTO admins (id, name, email, password_hash, role, is_active)
      VALUES (gen_random_uuid(), 'Super Admin', ${email}, ${passwordHash}, 'super_admin', true)
      ON CONFLICT (email) DO NOTHING;
    `;
    
    console.log('Super admin created successfully!');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
  } catch (error) {
    console.error('Failed to create super admin:', error);
  }
}

createSuperAdmin();
