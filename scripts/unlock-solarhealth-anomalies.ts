#!/usr/bin/env tsx

import PocketBase from "pocketbase";

const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || process.env.PB_URL;
const pbAdminEmail = process.env.POCKETBASE_ADMIN_EMAIL || process.env.PB_ADMIN_EMAIL;
const pbAdminPassword = process.env.POCKETBASE_ADMIN_PASSWORD || process.env.PB_ADMIN_PASSWORD;

if (!pbUrl || !pbAdminEmail || !pbAdminPassword) {
  console.error("Missing PocketBase admin environment variables");
  process.exit(1);
}

const pb = new PocketBase(pbUrl);
const adminEmail = pbAdminEmail;
const adminPassword = pbAdminPassword;

async function unlockSolarHealthAnomalies() {
  await pb.collection("_superusers").authWithPassword(adminEmail, adminPassword);

  const now = new Date();
  const minDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const maxDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const data = await pb.collection("linked_anomalies").getFullList({
    filter: pb.filter("automaton = {:automaton} && unlocked = false && date >= {:minDate} && date <= {:maxDate}", {
      automaton: "TelescopeSolar",
      minDate: minDate.toISOString(),
      maxDate: maxDate.toISOString(),
    }),
    fields: "id,legacyId",
  });

  if (data.length === 0) {
    console.log("No anomalies to unlock.");
    return;
  }

  for (const anomaly of data) {
    await pb.collection("linked_anomalies").update(anomaly.id, { unlocked: true });
    console.log(`Unlocked anomaly ${anomaly.legacyId}`);
  }
}

unlockSolarHealthAnomalies().catch((error) => {
  console.error(error);
  process.exit(1);
});
