-- Create push_anomaly_log table to track which anomalies have been notified about
create table if not exists public.push_anomaly_log (
  id uuid not null default gen_random_uuid (),
  anomaly_id bigint not null,
  sent_at timestamp with time zone null default now(),
  constraint push_anomaly_log_pkey primary key (id),
  constraint unique_anomaly_push_log unique (anomaly_id),
  constraint push_anomaly_log_anomaly_id_fkey foreign key (anomaly_id) references linked_anomalies (id) on delete cascade
) tablespace pg_default;

-- Enable RLS
alter table public.push_anomaly_log enable row level security;

-- Create policy to allow service role to manage logs
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'push_anomaly_log' and policyname = 'Service role can manage push anomaly logs') then
    create policy "Service role can manage push anomaly logs"
      on public.push_anomaly_log
      for all
      using (auth.role() = 'service_role');
  end if;
end
$$;

-- Add index for efficient querying
create index if not exists idx_push_anomaly_log_anomaly_id on public.push_anomaly_log (anomaly_id);
create index if not exists idx_push_anomaly_log_sent_at on public.push_anomaly_log (sent_at);