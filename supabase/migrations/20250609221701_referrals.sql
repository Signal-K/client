create table public.referrals (
  id uuid primary key default gen_random_uuid(),
  referree_id uuid not null references auth.users(id) on delete cascade,
  referral_code text not null,
  referred_at timestamp with time zone default timezone('utc', now())
);