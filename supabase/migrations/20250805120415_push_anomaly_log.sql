create table push_anomaly_log (
  id uuid primary key default gen_random_uuid(),
  anomaly_id bigint not null references linked_anomalies(id) on delete cascade,
  sent_at timestamp with time zone default now(),
  constraint unique_anomaly_push_log unique (anomaly_id)
);