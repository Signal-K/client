-- Create the nps_surveys table to store survey responses
create table
  public.nps_surveys (
    id uuid not null default gen_random_uuid(),
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone null default now(),
    
    -- NPS score (0-10)
    nps_score integer not null check (nps_score >= 0 and nps_score <= 10),
    
    -- Custom question about project interests
    project_interests text null,
    
    -- Optional reference to logged-in user
    user_id uuid null,
    
    -- Additional metadata
    user_agent text null,
    ip_address inet null,
    session_id text null,
    
    -- Constraints
    constraint nps_surveys_pkey primary key (id),
    constraint nps_surveys_user_id_fkey foreign key (user_id) references profiles (id) on delete set null
  ) tablespace pg_default;

-- Create indexes for better query performance
create index idx_nps_surveys_created_at on public.nps_surveys (created_at desc);
create index idx_nps_surveys_user_id on public.nps_surveys (user_id);
create index idx_nps_surveys_nps_score on public.nps_surveys (nps_score);

-- Enable Row Level Security (RLS)
alter table public.nps_surveys enable row level security;

-- Create policies for RLS
-- Allow anyone to insert survey responses (for anonymous surveys)
create policy "Anyone can insert survey responses" on public.nps_surveys
  for insert with check (true);

-- Allow users to view their own survey responses
create policy "Users can view their own survey responses" on public.nps_surveys
  for select using (auth.uid() = user_id);

-- Allow admins/service role to view all survey responses
create policy "Service role can view all survey responses" on public.nps_surveys
  for select using (auth.jwt() ->> 'role' = 'service_role');

-- Create a function to update the updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger to automatically update updated_at
create trigger handle_nps_surveys_updated_at
  before update on public.nps_surveys
  for each row execute function public.handle_updated_at();

-- Optional: Create a view for analytics (aggregated data)
create view public.nps_analytics as
select 
  date_trunc('day', created_at) as survey_date,
  count(*) as total_responses,
  avg(nps_score::numeric) as average_score,
  count(case when nps_score >= 9 then 1 end) as promoters,
  count(case when nps_score between 7 and 8 then 1 end) as passives,
  count(case when nps_score <= 6 then 1 end) as detractors,
  (count(case when nps_score >= 9 then 1 end)::numeric / count(*)::numeric * 100) - 
  (count(case when nps_score <= 6 then 1 end)::numeric / count(*)::numeric * 100) as nps_score_calculated
from public.nps_surveys
group by date_trunc('day', created_at)
order by survey_date desc;