// scripts/unlock-solarhealth-anomalies.js
// Unlocks SolarHealth linked_anomalies >24h old and <7d old

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function unlockSolarHealthAnomalies() {
  const now = new Date();
  const minDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
  const maxDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

  // Get all locked SolarHealth anomalies in window
  const { data, error } = await supabase
    .from('linked_anomalies')
    .select('*')
    .eq('automaton', 'TelescopeSolar')
    .eq('unlocked', false)
    .gte('date', minDate.toISOString())
    .lte('date', maxDate.toISOString());

  if (error) {
    console.error('Error fetching anomalies:', error);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.log('No anomalies to unlock.');
    return;
  }

  // Unlock each anomaly
  for (const anomaly of data) {
    const { error: updateError } = await supabase
      .from('linked_anomalies')
      .update({ unlocked: true })
      .eq('id', anomaly.id);
    if (updateError) {
      console.error(`Error unlocking anomaly ${anomaly.id}:`, updateError);
    } else {
      console.log(`Unlocked anomaly ${anomaly.id}`);
    }
  }
}

unlockSolarHealthAnomalies();
