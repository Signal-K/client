alter table public.profiles
add column if not exists referral_code text unique;

create or replace function public.generate_unique_referral_code()
returns text as $$
declare
  new_code text;
begin
  loop
    new_code := substr(md5(random()::text), 0, 9);
    exit when not exists (
      select 1 from public.profiles where referral_code = new_code
    );
  end loop;
  return new_code;
end;
$$ language plpgsql;

create or replace function public.generate_referral_code()
returns trigger as $$
begin
  if NEW.referral_code is null then
    NEW.referral_code := generate_unique_referral_code();
  end if;
  return NEW;
end;
$$ language plpgsql;

drop trigger if exists add_referral_code_before_insert on public.profiles;

create trigger add_referral_code_before_insert
before insert on public.profiles
for each row
execute function public.generate_referral_code();

update public.profiles
set referral_code = generate_unique_referral_code()
where referral_code is null;