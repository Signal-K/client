create table public.researched (
  id serial not null,
  tech_type character varying(50) not null,
  tech_id integer null,
  created_at timestamp without time zone null default CURRENT_TIMESTAMP,
  user_id uuid null,
  constraint researched_pkey primary key (id),
  constraint researched_user_id_fkey foreign KEY (user_id) references profiles (id)
) TABLESPACE pg_default;