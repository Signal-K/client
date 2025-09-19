const { createClient } = require('@supabase/supabase-js');
const { Pool } = require('pg');

// Remote Supabase client
const supabaseUrl = 'https://hlufptwhzkpkkjztimzo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsdWZwdHdoemtwa2tqenRpbXpvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxNjI5OTc1NSwiZXhwIjoyMDMxODc1NzU1fQ.JYo6Phyuc_a6TsctnvUUBvf8OVXQHDipiwI4l_5an3Q';
const supabase = createClient(supabaseUrl, supabaseKey);

// Local database pool
const pool = new Pool({
  host: 'localhost',
  port: 54322,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres',
});

const tables = [
  'profiles', 'anomalies', 'classifications', 'comments', 'events',
  'inventory', 'linked_anomalies', 'mineralDeposits', 'missions',
  'notification_rejections', 'nps_surveys', 'push_anomaly_log',
  'push_subscriptions', 'referrals', 'researched', 'routes',
  'sectors', 'unlocked_technologies', 'uploads', 'user_anomalies',
  'votes', 'zoo'
];

async function copyTable(tableName) {
  console.log(`Copying table: ${tableName}`);
  
  try {
    // Fetch all data from remote table
    const { data, error } = await supabase.from(tableName).select('*');
    
    if (error) {
      console.error(`Error fetching from ${tableName}:`, error);
      return;
    }
    
    if (!data || data.length === 0) {
      console.log(`Table ${tableName} is empty`);
      return;
    }
    
    const client = await pool.connect();
    
    try {
      // Insert data into local table
      let inserted = 0;
      for (const row of data) {
        const columns = Object.keys(row);
        const values = Object.values(row).map(v => {
          // Handle JSON columns
          if (typeof v === 'object' && v !== null) {
            return JSON.stringify(v);
          }
          return v;
        });
        const placeholders = values.map((_, i) => `$${i + 1}`);
        
        const query = `INSERT INTO "${tableName}" ("${columns.join('", "')}") VALUES (${placeholders.join(', ')}) ON CONFLICT DO NOTHING`;
        
        try {
          await client.query(query, values);
          inserted++;
        } catch (err) {
          console.error(`Error inserting into ${tableName}:`, err.message);
        }
      }
      
      console.log(`Inserted ${inserted} rows into ${tableName}`);
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error(`Error copying table ${tableName}:`, error);
  }
}

async function main() {
  try {
    console.log('Starting database copy...');
    
    // Copy each table
    for (const table of tables) {
      await copyTable(table);
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('Database copy completed!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

main();
