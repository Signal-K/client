create table public.user_milestones (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  week_start date not null,
  milestone_data jsonb not null,
  created_at timestamp default current_timestamp
);

-- Optional index for fast lookup
create index idx_user_milestones_user_week
  on public.user_milestones (user_id, week_start);
