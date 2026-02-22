#!/usr/bin/env tsx

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function unlockSolarHealthAnomalies() {
  const now = new Date();
  const minDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const maxDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const { data, error } = await supabase
    .from("linked_anomalies")
    .select("id")
    .eq("automaton", "TelescopeSolar")
    .eq("unlocked", false)
    .gte("date", minDate.toISOString())
    .lte("date", maxDate.toISOString());

  if (error) {
    console.error("Error fetching anomalies:", error);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.log("No anomalies to unlock.");
    return;
  }

  for (const anomaly of data) {
    const { error: updateError } = await supabase
      .from("linked_anomalies")
      .update({ unlocked: true })
      .eq("id", anomaly.id);

    if (updateError) {
      console.error(`Error unlocking anomaly ${anomaly.id}:`, updateError);
    } else {
      console.log(`Unlocked anomaly ${anomaly.id}`);
    }
  }
}

unlockSolarHealthAnomalies().catch((error) => {
  console.error(error);
  process.exit(1);
});
