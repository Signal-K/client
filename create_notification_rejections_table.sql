-- Create notification_rejections table to track users who have rejected push notifications
create table if not exists
  public.notification_rejections (
    id uuid not null default gen_random_uuid (),
    profile_id uuid not null,
    created_at timestamp with time zone null default now(),
    constraint notification_rejections_pkey primary key (id),
    constraint notification_rejections_profile_id_fkey foreign key (profile_id) references profiles (id) on delete cascade
  ) tablespace pg_default;

-- Create index for efficient lookups by profile_id
create index if not exists idx_notification_rejections_profile_id on public.notification_rejections using btree (profile_id) tablespace pg_default;

-- Add RLS policies
alter table public.notification_rejections enable row level security;

-- Policy: Users can only see and manage their own rejections
create policy "Users can manage their own notification rejections" on public.notification_rejections
  for all using (auth.uid() = profile_id);
