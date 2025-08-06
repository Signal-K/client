CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

create table
  public.nps_surveys (
    id uuid not null default gen_random_uuid (),
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone null default now(),
    nps_score integer not null,
    project_interests text null,
    user_id uuid null,
    user_agent text null,
    ip_address inet null,
    session_id text null,
    constraint nps_surveys_pkey primary key (id),
    constraint nps_surveys_user_id_fkey foreign key (user_id) references profiles (id) on delete set null,
    constraint nps_surveys_nps_score_check check (
      (
        (nps_score >= 0)
        and (nps_score <= 10)
      )
    )
  ) tablespace pg_default;

create index if not exists idx_nps_surveys_created_at on public.nps_surveys using btree (created_at desc) tablespace pg_default;

create index if not exists idx_nps_surveys_user_id on public.nps_surveys using btree (user_id) tablespace pg_default;

create index if not exists idx_nps_surveys_nps_score on public.nps_surveys using btree (nps_score) tablespace pg_default;

create trigger handle_nps_surveys_updated_at before
update on nps_surveys for each row
execute function handle_updated_at ();

create view
  public.nps_analytics as
select
  date_trunc('day'::text, nps_surveys.created_at) as survey_date,
  count(*) as total_responses,
  avg(nps_surveys.nps_score::numeric) as average_score,
  count(
    case
      when nps_surveys.nps_score >= 9 then 1
      else null::integer
    end
  ) as promoters,
  count(
    case
      when nps_surveys.nps_score >= 7
      and nps_surveys.nps_score <= 8 then 1
      else null::integer
    end
  ) as passives,
  count(
    case
      when nps_surveys.nps_score <= 6 then 1
      else null::integer
    end
  ) as detractors,
  count(
    case
      when nps_surveys.nps_score >= 9 then 1
      else null::integer
    end
  )::numeric / count(*)::numeric * 100::numeric - count(
    case
      when nps_surveys.nps_score <= 6 then 1
      else null::integer
    end
  )::numeric / count(*)::numeric * 100::numeric as nps_score_calculated
from
  nps_surveys
group by
  (date_trunc('day'::text, nps_surveys.created_at))
order by
  (date_trunc('day'::text, nps_surveys.created_at)) desc;