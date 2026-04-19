require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');

const sql = neon(process.env.DATABASE_URL);

async function runSeed() {
  try {
    const seedQuery = fs.readFileSync('scripts/seed.sql', 'utf8');
    
    // Split queries by semicolon to execute them sequentially
    const queries = seedQuery.split(';').map(q => q.trim()).filter(q => q.length > 0);
    
    for (const q of queries) {
      console.log('Executing:', q.substring(0, 50) + '...');
      await sql.query(q);
    }
    
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Failed to seed database:', error);
  }
}

runSeed();
