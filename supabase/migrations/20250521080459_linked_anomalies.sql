create or replace function create_linked_anomalies_table()
returns void as $$
begin
  create table if not exists public.linked_anomalies (
    id bigint generated by default as identity primary key,
    author uuid not null,
    anomaly_id bigint not null,
    classification_id bigint not null,
    date timestamptz not null default now(),
    automaton text null,

    constraint linked_anomalies_author_fkey
      foreign key (author) references public.profiles(id) on delete cascade,

    constraint linked_anomalies_anomaly_fkey
      foreign key (anomaly_id) references public.anomalies(id) on delete cascade,

    constraint linked_anomalies_classification_fkey
      foreign key (classification_id) references public.anomalies(id) on delete cascade
  );
end;
$$ language plpgsql;