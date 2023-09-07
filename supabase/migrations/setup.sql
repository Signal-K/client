-- Alter the existing profiles table
alter table profiles
  add column address text,
  add column location text,
  add column cover text,
  add column reputation numeric,
  add column address2 text;

alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using (true);

create policy "Users can insert their own profile."
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile."
  on profiles for update
  using (auth.uid() = id);

-- Create a trigger to sync profiles and auth.users
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Alter the existing posts table
alter table posts_duplicates
  rename to posts;

alter table posts enable row level security;

create policy "Posts are viewable by everyone."
  on posts for select
  using (true);

create policy "Users can post as themselves."
  on posts for insert
  with check (auth.uid() = "author");

-- Create the remaining tables (sites and votes) and their policies

-- Create a table for sites
create table sites (
    id bigserial not null,
    "siteDomain" text not null,
    "ownerId" uuid not null,
    "name" text not null,

    primary key (id)
);

alter table sites enable row level security;

create policy "Sites are viewable by everyone."
    on sites for select
    using (true);

create policy "Users can create their own sites."
    on sites for insert
    with check (auth.uid() = "ownerId");

-- Create a table for votes
create table votes (
    "postId" bigint not null references posts (id),
    "userId" uuid not null references profiles (id),
    "value" int not null,

    primary key ("postId", "userId"),
    constraint vote_quantity check (value <= 1 and value >= -1)
);

alter table votes enable row level security;

create policy "Votes are viewable by everyone"
    on votes for select
    using (true);

create policy "Users can vote as themselves"
    on votes for insert
    with check (auth.uid() = "userId");

create policy "Users can update their own votes"
    on votes for update
    using (auth.uid() = "userId");

-- Set up Realtime!
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table posts, sites, votes, profiles;

-- Set up Storage!
insert into storage.buckets (id, name)
values ('avatars', 'avatars');

create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Anyone can upload an avatar."
  on storage.objects for insert
  with check (bucket_id = 'avatars');

-- Rest of the SQL code remains the same
-- ...
