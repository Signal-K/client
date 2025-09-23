

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE SCHEMA IF NOT EXISTS "vecs";


ALTER SCHEMA "vecs" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "wrappers" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."archive_all_automaton_anomalies"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE anomalies
  SET anomalySet = 'automaton-aiForMars-archive'
  WHERE anomalySet = 'automaton-aiForMars';
END;
$$;


ALTER FUNCTION "public"."archive_all_automaton_anomalies"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."archive_missing_anomalies"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  ids_to_keep bigint[] := ARRAY[
    40424669, 44307415, 46881149, 46881203, 47229542, 55137778, 57159366,
    57161224, 57161981, 57166042, 57511112, 57511636, 57514102, 57537348,
    57538410, 69592674, 74589388, 74652652, 74652678, 74652771, 79738503, 79738567
  ];
  non_matching_count bigint;
  updated_count bigint;
BEGIN
  -- Count non-matching rows
  SELECT COUNT(*)
  INTO non_matching_count
  FROM public.anomalies
  WHERE "anomalySet" = 'automaton-aiForMars'
    AND id NOT IN (SELECT unnest(ids_to_keep));

  -- Output the count of non-matching rows
  RAISE NOTICE 'Non-matching rows count: %', non_matching_count;

  -- Update the anomalySet for non-matching rows
  UPDATE public.anomalies
  SET "anomalySet" = 'automaton-aiForMars-archive'
  WHERE "anomalySet" = 'automaton-aiForMars'
    AND id NOT IN (SELECT unnest(ids_to_keep));

  -- Count how many rows were updated
  GET DIAGNOSTICS updated_count = ROW_COUNT;

  -- Output the count of updated rows
  RAISE NOTICE 'Updated rows count: %', updated_count;

  -- Check if any rows were updated
  IF updated_count = 0 THEN
    RAISE NOTICE 'No rows were updated.';
  END IF;
END;
$$;


ALTER FUNCTION "public"."archive_missing_anomalies"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."archive_old_cloud_anomalies"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE anomalies
  SET anomalytype = 'cloud_archive'
  WHERE id IN (
    104282809,
    104283270,
    104283421,
    104283590,
    104283739,
    104283832,
    104283911,
    104284601,
    104285132,
    104285330,
    104285574,
    104285644,
    104285810,
    104285865,
    104286112,
    106538942,
    106539291,
    8423850802,
    8423850803,
    9490482201,
    9490482202,
    9490482203,
    9490482204
  );
END;
$$;


ALTER FUNCTION "public"."archive_old_cloud_anomalies"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."archive_unmatched_automaton_anomalies"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE anomalies
  SET anomalySet = 'automaton-aiForMars-archive'
  WHERE anomalySet = 'automaton-aiForMars'
    AND id::text NOT IN (
      '40424669', '44307415', '46881149', '46881203', '47229542',
      '55137778', '57159366', '57161224', '57161981', '57166042',
      '57511112', '57511636', '57514102', '57537348', '57538410',
      '69592674', '74589388', '74652652', '74652678', '74652771',
      '79738503', '79738567'
    )
    AND content::text NOT IN (
      '40424669', '44307415', '46881149', '46881203', '47229542',
      '55137778', '57159366', '57161224', '57161981', '57166042',
      '57511112', '57511636', '57514102', '57537348', '57538410',
      '69592674', '74589388', '74652652', '74652678', '74652771',
      '79738503', '79738567'
    );
END;
$$;


ALTER FUNCTION "public"."archive_unmatched_automaton_anomalies"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_referral_code"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$declare
  new_code text;
begin
  loop
    new_code := substr(md5(random()::text), 1, 9);
    exit when not exists (
      select 1 from public.profiles where referral_code = new_code
    );
  end loop;
  return new_code;
end;$$;


ALTER FUNCTION "public"."generate_referral_code"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_unique_referral_code"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."generate_unique_referral_code"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_random_anomaly"("anomaly_type" "text", "anomaly_set" "text") RETURNS TABLE("id" bigint, "content" "text", "ticId" "text", "anomalytype" "text", "type" "text", "radius" double precision, "mass" double precision, "density" double precision, "gravity" double precision, "temperatureEq" double precision, "temperature" double precision, "smaxis" double precision, "orbital_period" double precision, "classification_status" "text", "avatar_url" "text", "created_at" timestamp with time zone, "deepnote" "text", "lightkurve" "text", "configuration" "jsonb", "parentAnomaly" bigint, "anomalySet" "text")
    LANGUAGE "sql"
    AS $_$
    select * 
    from anomalies
    where anomalytype = anomaly_type
      and ($1 is null or "anomalySet" = anomaly_set)
    order by random()
    limit 1;
$_$;


ALTER FUNCTION "public"."get_random_anomaly"("anomaly_type" "text", "anomaly_set" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_votes_schema_to_local"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
begin
  -- Step 1: Add `vote_type` column if it doesn't exist
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'votes' and column_name = 'vote_type'
  ) then
    alter table public.votes
    add column vote_type text default 'up';
  end if;

  -- Step 2: Add check constraint to `vote_type`
  begin
    alter table public.votes
    add constraint votes_vote_type_check
    check (vote_type = any (array['up', 'down']));
  exception
    when duplicate_object then
      -- Constraint already exists, do nothing
      null;
  end;
end;
$$;


ALTER FUNCTION "public"."sync_votes_schema_to_local"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."anomalies" (
    "id" bigint NOT NULL,
    "content" "text",
    "ticId" "text",
    "anomalytype" "text",
    "type" "text",
    "radius" double precision,
    "mass" double precision,
    "density" double precision,
    "gravity" double precision,
    "temperatureEq" double precision,
    "temperature" double precision,
    "smaxis" double precision,
    "orbital_period" double precision,
    "classification_status" "text",
    "avatar_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deepnote" "text",
    "lightkurve" "text",
    "configuration" "jsonb",
    "parentAnomaly" bigint,
    "anomalySet" "text",
    "anomalyConfiguration" "jsonb"
);


ALTER TABLE "public"."anomalies" OWNER TO "postgres";


COMMENT ON COLUMN "public"."anomalies"."anomalyConfiguration" IS 'JSONB field for storing anomaly-specific configuration data';



ALTER TABLE "public"."anomalies" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."anomalies_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."classifications" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "content" "text",
    "author" "uuid",
    "anomaly" bigint,
    "media" "json",
    "classificationtype" "text",
    "classificationConfiguration" "jsonb"
);


ALTER TABLE "public"."classifications" OWNER TO "postgres";


ALTER TABLE "public"."classifications" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."classifications_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."comments" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "content" "text" NOT NULL,
    "author" "uuid" NOT NULL,
    "classification_id" bigint,
    "parent_comment_id" bigint,
    "configuration" "jsonb",
    "uploads" bigint,
    "surveyor" boolean,
    "confirmed" boolean,
    "value" "text",
    "category" "text"
);


ALTER TABLE "public"."comments" OWNER TO "postgres";


COMMENT ON COLUMN "public"."comments"."surveyor" IS 'Is this comment related to classification metadata';



COMMENT ON COLUMN "public"."comments"."confirmed" IS 'By author of classification';



ALTER TABLE "public"."comments" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."comments_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."events" (
    "id" bigint NOT NULL,
    "location" bigint NOT NULL,
    "classification_location" bigint NOT NULL,
    "type" "text" NOT NULL,
    "configuration" "jsonb" NOT NULL,
    "time" timestamp with time zone DEFAULT "now"() NOT NULL,
    "completed" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."events" OWNER TO "postgres";


ALTER TABLE "public"."events" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."events_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."inventory" (
    "id" bigint NOT NULL,
    "item" bigint,
    "owner" "uuid",
    "quantity" double precision,
    "notes" "text",
    "time_of_deploy" timestamp with time zone,
    "anomaly" bigint,
    "parentItem" bigint,
    "configuration" "jsonb",
    "terrarium" bigint
);


ALTER TABLE "public"."inventory" OWNER TO "postgres";


COMMENT ON COLUMN "public"."inventory"."terrarium" IS 'Anomaly location (for structures on terrariums)';



ALTER TABLE "public"."inventory" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."inventory_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."linked_anomalies" (
    "id" bigint NOT NULL,
    "author" "uuid" NOT NULL,
    "anomaly_id" bigint NOT NULL,
    "classification_id" bigint,
    "date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "automaton" "text",
    "unlocked" boolean,
    "unlock_time" timestamp with time zone
);


ALTER TABLE "public"."linked_anomalies" OWNER TO "postgres";


COMMENT ON COLUMN "public"."linked_anomalies"."unlocked" IS 'Tracks whether a satellite anomaly has been unlocked by the user. NULL means not applicable, false means locked, true means unlocked.';



COMMENT ON COLUMN "public"."linked_anomalies"."unlock_time" IS 'Timestamp when the satellite anomaly was unlocked by the user.';



ALTER TABLE "public"."linked_anomalies" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."linked_anomalies_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."mineralDeposits" (
    "id" bigint NOT NULL,
    "anomaly" bigint,
    "owner" "uuid",
    "mineralconfiguration" "jsonb"
);


ALTER TABLE "public"."mineralDeposits" OWNER TO "postgres";


ALTER TABLE "public"."mineralDeposits" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."mineralDeposits_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."missions" (
    "id" bigint NOT NULL,
    "user" "uuid",
    "time_of_completion" timestamp with time zone,
    "mission" bigint,
    "configuration" "jsonb",
    "rewarded_items" bigint[]
);


ALTER TABLE "public"."missions" OWNER TO "postgres";


ALTER TABLE "public"."missions" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."missions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."notification_rejections" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."notification_rejections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."nps_surveys" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "nps_score" integer NOT NULL,
    "project_interests" "text",
    "user_id" "uuid",
    "user_agent" "text",
    "ip_address" "inet",
    "session_id" "text",
    CONSTRAINT "nps_surveys_nps_score_check" CHECK ((("nps_score" >= 0) AND ("nps_score" <= 10)))
);


ALTER TABLE "public"."nps_surveys" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."nps_analytics" AS
 SELECT "date_trunc"('day'::"text", "nps_surveys"."created_at") AS "survey_date",
    "count"(*) AS "total_responses",
    "avg"(("nps_surveys"."nps_score")::numeric) AS "average_score",
    "count"(
        CASE
            WHEN ("nps_surveys"."nps_score" >= 9) THEN 1
            ELSE NULL::integer
        END) AS "promoters",
    "count"(
        CASE
            WHEN (("nps_surveys"."nps_score" >= 7) AND ("nps_surveys"."nps_score" <= 8)) THEN 1
            ELSE NULL::integer
        END) AS "passives",
    "count"(
        CASE
            WHEN ("nps_surveys"."nps_score" <= 6) THEN 1
            ELSE NULL::integer
        END) AS "detractors",
    (((("count"(
        CASE
            WHEN ("nps_surveys"."nps_score" >= 9) THEN 1
            ELSE NULL::integer
        END))::numeric / ("count"(*))::numeric) * (100)::numeric) - ((("count"(
        CASE
            WHEN ("nps_surveys"."nps_score" <= 6) THEN 1
            ELSE NULL::integer
        END))::numeric / ("count"(*))::numeric) * (100)::numeric)) AS "nps_score_calculated"
   FROM "public"."nps_surveys"
  GROUP BY ("date_trunc"('day'::"text", "nps_surveys"."created_at"))
  ORDER BY ("date_trunc"('day'::"text", "nps_surveys"."created_at")) DESC;


ALTER TABLE "public"."nps_analytics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "updated_at" timestamp with time zone,
    "username" "text",
    "full_name" "text",
    "avatar_url" "text",
    "website" "text",
    "location" bigint,
    "activemission" bigint,
    "classificationPoints" bigint,
    "push_subscription" "jsonb",
    "referral_code" "text",
    CONSTRAINT "username_length" CHECK (("char_length"("username") >= 3))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."push_anomaly_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "anomaly_id" bigint NOT NULL,
    "sent_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."push_anomaly_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."push_subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "endpoint" "text" NOT NULL,
    "p256dh" "text" NOT NULL,
    "auth" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."push_subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."referrals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "referree_id" "uuid" NOT NULL,
    "referral_code" "text" NOT NULL,
    "referred_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."referrals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."researched" (
    "id" integer NOT NULL,
    "tech_type" character varying(50) NOT NULL,
    "tech_id" integer,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "user_id" "uuid"
);


ALTER TABLE "public"."researched" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."researched_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."researched_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."researched_id_seq" OWNED BY "public"."researched"."id";



CREATE TABLE IF NOT EXISTS "public"."routes" (
    "id" bigint NOT NULL,
    "author" "uuid" NOT NULL,
    "routeConfiguration" "jsonb",
    "timestamp" timestamp with time zone DEFAULT "now"() NOT NULL,
    "location" bigint NOT NULL
);


ALTER TABLE "public"."routes" OWNER TO "postgres";


COMMENT ON TABLE "public"."routes" IS 'Stores route configurations created by users for specific anomaly locations';



COMMENT ON COLUMN "public"."routes"."author" IS 'User who created this route';



COMMENT ON COLUMN "public"."routes"."routeConfiguration" IS 'JSON configuration data for the route';



COMMENT ON COLUMN "public"."routes"."timestamp" IS 'When the route was created';



COMMENT ON COLUMN "public"."routes"."location" IS 'Anomaly location where this route applies';



ALTER TABLE "public"."routes" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."routes_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."sectors" (
    "id" bigint NOT NULL,
    "anomaly" bigint,
    "deposit" bigint
);


ALTER TABLE "public"."sectors" OWNER TO "postgres";


ALTER TABLE "public"."sectors" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."sectors_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."unlocked_technologies" (
    "id" integer NOT NULL,
    "user_id" integer NOT NULL,
    "tech_type" character varying(50) NOT NULL,
    "tech_id" integer NOT NULL,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."unlocked_technologies" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."unlocked_technologies_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."unlocked_technologies_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."unlocked_technologies_id_seq" OWNED BY "public"."unlocked_technologies"."id";



CREATE TABLE IF NOT EXISTS "public"."uploads" (
    "id" bigint NOT NULL,
    "author" "uuid" NOT NULL,
    "location" bigint NOT NULL,
    "configuration" "jsonb",
    "source" "text" NOT NULL,
    "file_url" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "content" "text",
    "name" "text",
    "originating_location" "text"
);


ALTER TABLE "public"."uploads" OWNER TO "postgres";


COMMENT ON COLUMN "public"."uploads"."name" IS 'Name of species/entity';



ALTER TABLE "public"."uploads" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."uploads_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."user_anomalies" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "anomaly_id" bigint NOT NULL,
    "ownership_date" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_anomalies" OWNER TO "postgres";


ALTER TABLE "public"."user_anomalies" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."user_anomalies_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."votes" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "classification_id" bigint,
    "anomaly_id" bigint,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "upload" bigint,
    "vote_type" "text"
);


ALTER TABLE "public"."votes" OWNER TO "postgres";


ALTER TABLE "public"."votes" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."votes_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."zoo" (
    "id" bigint NOT NULL,
    "author" "uuid" NOT NULL,
    "owner" "uuid" NOT NULL,
    "location" bigint,
    "configuration" "jsonb",
    "uploaded" bigint,
    "content" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "file_url" "text" NOT NULL
);


ALTER TABLE "public"."zoo" OWNER TO "postgres";


ALTER TABLE "public"."zoo" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."zoo_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "vecs"."image_vectors" (
    "id" character varying NOT NULL,
    "vec" "public"."vector"(512) NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL
);


ALTER TABLE "vecs"."image_vectors" OWNER TO "postgres";


ALTER TABLE ONLY "public"."researched" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."researched_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."unlocked_technologies" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."unlocked_technologies_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."anomalies"
    ADD CONSTRAINT "baseplanets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."classifications"
    ADD CONSTRAINT "classifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."inventory"
    ADD CONSTRAINT "inventory_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."linked_anomalies"
    ADD CONSTRAINT "linked_anomalies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mineralDeposits"
    ADD CONSTRAINT "mineraldeposits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."missions"
    ADD CONSTRAINT "missions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notification_rejections"
    ADD CONSTRAINT "notification_rejections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."nps_surveys"
    ADD CONSTRAINT "nps_surveys_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_referral_code_key" UNIQUE ("referral_code");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."push_anomaly_log"
    ADD CONSTRAINT "push_anomaly_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."push_subscriptions"
    ADD CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."referrals"
    ADD CONSTRAINT "referrals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."researched"
    ADD CONSTRAINT "researched_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."routes"
    ADD CONSTRAINT "routes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sectors"
    ADD CONSTRAINT "sectors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."push_anomaly_log"
    ADD CONSTRAINT "unique_anomaly_push_log" UNIQUE ("anomaly_id");



ALTER TABLE ONLY "public"."unlocked_technologies"
    ADD CONSTRAINT "unlocked_technologies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."uploads"
    ADD CONSTRAINT "uploads_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_anomalies"
    ADD CONSTRAINT "user_anomalies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_user_id_classification_id_key" UNIQUE ("user_id", "classification_id");



ALTER TABLE ONLY "public"."zoo"
    ADD CONSTRAINT "zoo_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "vecs"."image_vectors"
    ADD CONSTRAINT "image_vectors_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_linked_anomalies_author_automaton_unlocked" ON "public"."linked_anomalies" USING "btree" ("author", "automaton", "unlocked");



CREATE INDEX "idx_linked_anomalies_unlock_time" ON "public"."linked_anomalies" USING "btree" ("unlock_time") WHERE ("unlock_time" IS NOT NULL);



CREATE INDEX "idx_linked_anomalies_unlocked" ON "public"."linked_anomalies" USING "btree" ("unlocked") WHERE ("unlocked" IS NOT NULL);



CREATE INDEX "idx_notification_rejections_profile_id" ON "public"."notification_rejections" USING "btree" ("profile_id");



CREATE INDEX "idx_nps_surveys_created_at" ON "public"."nps_surveys" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_nps_surveys_nps_score" ON "public"."nps_surveys" USING "btree" ("nps_score");



CREATE INDEX "idx_nps_surveys_user_id" ON "public"."nps_surveys" USING "btree" ("user_id");



CREATE INDEX "idx_push_anomaly_log_anomaly_id" ON "public"."push_anomaly_log" USING "btree" ("anomaly_id");



CREATE INDEX "idx_push_anomaly_log_sent_at" ON "public"."push_anomaly_log" USING "btree" ("sent_at");



CREATE INDEX "idx_routes_author" ON "public"."routes" USING "btree" ("author");



CREATE INDEX "idx_routes_location" ON "public"."routes" USING "btree" ("location");



CREATE INDEX "idx_routes_timestamp" ON "public"."routes" USING "btree" ("timestamp" DESC);



CREATE INDEX "ix_vector_cosine_ops_hnsw_m16_efc64_8291b92" ON "vecs"."image_vectors" USING "hnsw" ("vec" "public"."vector_cosine_ops") WITH ("m"='16', "ef_construction"='64');



CREATE OR REPLACE TRIGGER "handle_nps_surveys_updated_at" BEFORE UPDATE ON "public"."nps_surveys" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



ALTER TABLE ONLY "public"."anomalies"
    ADD CONSTRAINT "anomalies_parentAnomaly_fkey" FOREIGN KEY ("parentAnomaly") REFERENCES "public"."anomalies"("id");



ALTER TABLE ONLY "public"."classifications"
    ADD CONSTRAINT "classifications_anomaly_fkey" FOREIGN KEY ("anomaly") REFERENCES "public"."anomalies"("id");



ALTER TABLE ONLY "public"."classifications"
    ADD CONSTRAINT "classifications_author_fkey" FOREIGN KEY ("author") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_author_fkey" FOREIGN KEY ("author") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_classification_fkey" FOREIGN KEY ("classification_id") REFERENCES "public"."classifications"("id");



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_parent_comment_fkey" FOREIGN KEY ("parent_comment_id") REFERENCES "public"."comments"("id");



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_uploads_fkey" FOREIGN KEY ("uploads") REFERENCES "public"."uploads"("id");



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_classification_location_fkey" FOREIGN KEY ("classification_location") REFERENCES "public"."classifications"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_location_fkey" FOREIGN KEY ("location") REFERENCES "public"."anomalies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."inventory"
    ADD CONSTRAINT "inventory_anomaly_fkey" FOREIGN KEY ("anomaly") REFERENCES "public"."anomalies"("id");



ALTER TABLE ONLY "public"."inventory"
    ADD CONSTRAINT "inventory_owner_fkey" FOREIGN KEY ("owner") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."inventory"
    ADD CONSTRAINT "inventory_parentitem_fkey" FOREIGN KEY ("parentItem") REFERENCES "public"."inventory"("id");



ALTER TABLE ONLY "public"."inventory"
    ADD CONSTRAINT "inventory_terrarium_fkey" FOREIGN KEY ("terrarium") REFERENCES "public"."classifications"("id");



ALTER TABLE ONLY "public"."linked_anomalies"
    ADD CONSTRAINT "linked_anomalies_anomaly_fkey" FOREIGN KEY ("anomaly_id") REFERENCES "public"."anomalies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."linked_anomalies"
    ADD CONSTRAINT "linked_anomalies_author_fkey" FOREIGN KEY ("author") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."linked_anomalies"
    ADD CONSTRAINT "linked_anomalies_classification_fkey" FOREIGN KEY ("classification_id") REFERENCES "public"."classifications"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mineralDeposits"
    ADD CONSTRAINT "mineraldeposits_anomaly_fkey" FOREIGN KEY ("anomaly") REFERENCES "public"."anomalies"("id");



ALTER TABLE ONLY "public"."mineralDeposits"
    ADD CONSTRAINT "mineraldeposits_owner_fkey" FOREIGN KEY ("owner") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."missions"
    ADD CONSTRAINT "missions_user_fkey" FOREIGN KEY ("user") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."notification_rejections"
    ADD CONSTRAINT "notification_rejections_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."nps_surveys"
    ADD CONSTRAINT "nps_surveys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_location_fkey" FOREIGN KEY ("location") REFERENCES "public"."anomalies"("id");



ALTER TABLE ONLY "public"."push_anomaly_log"
    ADD CONSTRAINT "push_anomaly_log_anomaly_id_fkey" FOREIGN KEY ("anomaly_id") REFERENCES "public"."linked_anomalies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."push_subscriptions"
    ADD CONSTRAINT "push_subscriptions_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."referrals"
    ADD CONSTRAINT "referrals_referree_id_fkey" FOREIGN KEY ("referree_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."researched"
    ADD CONSTRAINT "researched_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."routes"
    ADD CONSTRAINT "routes_author_fkey" FOREIGN KEY ("author") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."routes"
    ADD CONSTRAINT "routes_location_fkey" FOREIGN KEY ("location") REFERENCES "public"."anomalies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sectors"
    ADD CONSTRAINT "sectors_anomaly_fkey" FOREIGN KEY ("anomaly") REFERENCES "public"."anomalies"("id");



ALTER TABLE ONLY "public"."uploads"
    ADD CONSTRAINT "uploads_author_fkey" FOREIGN KEY ("author") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."uploads"
    ADD CONSTRAINT "uploads_location_fkey" FOREIGN KEY ("location") REFERENCES "public"."anomalies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_anomalies"
    ADD CONSTRAINT "user_anomalies_anomaly_fkey" FOREIGN KEY ("anomaly_id") REFERENCES "public"."anomalies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_anomalies"
    ADD CONSTRAINT "user_anomalies_user_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_anomaly_id_fkey" FOREIGN KEY ("anomaly_id") REFERENCES "public"."anomalies"("id");



ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_classification_id_fkey" FOREIGN KEY ("classification_id") REFERENCES "public"."classifications"("id");



ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_upload_fkey" FOREIGN KEY ("upload") REFERENCES "public"."uploads"("id");



ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."zoo"
    ADD CONSTRAINT "zoo_author_fkey" FOREIGN KEY ("author") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."zoo"
    ADD CONSTRAINT "zoo_location_fkey" FOREIGN KEY ("location") REFERENCES "public"."inventory"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."zoo"
    ADD CONSTRAINT "zoo_uploaded_fkey" FOREIGN KEY ("uploaded") REFERENCES "public"."uploads"("id") ON DELETE CASCADE;



CREATE POLICY "Public profiles are viewable by everyone." ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Service role can manage push anomaly logs" ON "public"."push_anomaly_log" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Users can insert their own profile." ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can manage their own notification rejections" ON "public"."notification_rejections" USING (("auth"."uid"() = "profile_id"));



CREATE POLICY "Users can update own profile." ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."notification_rejections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_in"("cstring", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_in"("cstring", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_in"("cstring", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_in"("cstring", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_out"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_out"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_out"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_out"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_recv"("internal", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_recv"("internal", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_recv"("internal", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_recv"("internal", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_send"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_send"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_send"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_send"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_typmod_in"("cstring"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_typmod_in"("cstring"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_typmod_in"("cstring"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_typmod_in"("cstring"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_in"("cstring", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_in"("cstring", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_in"("cstring", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_in"("cstring", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_out"("public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_out"("public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_out"("public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_out"("public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_recv"("internal", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_recv"("internal", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_recv"("internal", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_recv"("internal", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_send"("public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_send"("public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_send"("public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_send"("public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_typmod_in"("cstring"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_typmod_in"("cstring"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_typmod_in"("cstring"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_typmod_in"("cstring"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_in"("cstring", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_in"("cstring", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_in"("cstring", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_in"("cstring", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_out"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_out"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_out"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_out"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_recv"("internal", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_recv"("internal", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_recv"("internal", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_recv"("internal", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_send"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_send"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_send"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_send"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_typmod_in"("cstring"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_typmod_in"("cstring"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_typmod_in"("cstring"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_typmod_in"("cstring"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_halfvec"(real[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(real[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(real[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(real[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_vector"(real[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_vector"(real[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_vector"(real[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_vector"(real[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_halfvec"(double precision[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(double precision[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(double precision[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(double precision[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_vector"(double precision[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_vector"(double precision[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_vector"(double precision[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_vector"(double precision[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_halfvec"(integer[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(integer[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(integer[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(integer[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_vector"(integer[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_vector"(integer[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_vector"(integer[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_vector"(integer[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_halfvec"(numeric[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(numeric[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(numeric[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(numeric[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_vector"(numeric[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_vector"(numeric[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_vector"(numeric[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_vector"(numeric[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_to_float4"("public"."halfvec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_to_float4"("public"."halfvec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_to_float4"("public"."halfvec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_to_float4"("public"."halfvec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec"("public"."halfvec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec"("public"."halfvec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec"("public"."halfvec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec"("public"."halfvec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_to_sparsevec"("public"."halfvec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_to_sparsevec"("public"."halfvec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_to_sparsevec"("public"."halfvec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_to_sparsevec"("public"."halfvec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_to_vector"("public"."halfvec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_to_vector"("public"."halfvec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_to_vector"("public"."halfvec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_to_vector"("public"."halfvec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_to_halfvec"("public"."sparsevec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_to_halfvec"("public"."sparsevec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_to_halfvec"("public"."sparsevec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_to_halfvec"("public"."sparsevec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec"("public"."sparsevec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec"("public"."sparsevec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec"("public"."sparsevec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec"("public"."sparsevec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_to_vector"("public"."sparsevec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_to_vector"("public"."sparsevec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_to_vector"("public"."sparsevec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_to_vector"("public"."sparsevec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_to_float4"("public"."vector", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_to_float4"("public"."vector", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_to_float4"("public"."vector", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_to_float4"("public"."vector", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_to_halfvec"("public"."vector", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_to_halfvec"("public"."vector", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_to_halfvec"("public"."vector", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_to_halfvec"("public"."vector", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_to_sparsevec"("public"."vector", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_to_sparsevec"("public"."vector", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_to_sparsevec"("public"."vector", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_to_sparsevec"("public"."vector", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector"("public"."vector", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector"("public"."vector", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."vector"("public"."vector", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector"("public"."vector", integer, boolean) TO "service_role";



































































































































































































































































































GRANT ALL ON FUNCTION "public"."archive_all_automaton_anomalies"() TO "anon";
GRANT ALL ON FUNCTION "public"."archive_all_automaton_anomalies"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."archive_all_automaton_anomalies"() TO "service_role";



GRANT ALL ON FUNCTION "public"."archive_missing_anomalies"() TO "anon";
GRANT ALL ON FUNCTION "public"."archive_missing_anomalies"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."archive_missing_anomalies"() TO "service_role";



GRANT ALL ON FUNCTION "public"."archive_old_cloud_anomalies"() TO "anon";
GRANT ALL ON FUNCTION "public"."archive_old_cloud_anomalies"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."archive_old_cloud_anomalies"() TO "service_role";



GRANT ALL ON FUNCTION "public"."archive_unmatched_automaton_anomalies"() TO "anon";
GRANT ALL ON FUNCTION "public"."archive_unmatched_automaton_anomalies"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."archive_unmatched_automaton_anomalies"() TO "service_role";



GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_referral_code"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_referral_code"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_referral_code"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_unique_referral_code"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_unique_referral_code"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_unique_referral_code"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_random_anomaly"("anomaly_type" "text", "anomaly_set" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_random_anomaly"("anomaly_type" "text", "anomaly_set" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_random_anomaly"("anomaly_type" "text", "anomaly_set" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_accum"(double precision[], "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_accum"(double precision[], "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_accum"(double precision[], "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_accum"(double precision[], "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_add"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_add"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_add"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_add"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_avg"(double precision[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_avg"(double precision[]) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_avg"(double precision[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_avg"(double precision[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_cmp"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_cmp"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_cmp"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_cmp"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_combine"(double precision[], double precision[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_combine"(double precision[], double precision[]) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_combine"(double precision[], double precision[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_combine"(double precision[], double precision[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_concat"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_concat"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_concat"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_concat"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_eq"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_eq"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_eq"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_eq"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_ge"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_ge"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_ge"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_ge"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_gt"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_gt"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_gt"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_gt"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_l2_squared_distance"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_l2_squared_distance"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_l2_squared_distance"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_l2_squared_distance"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_le"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_le"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_le"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_le"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_lt"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_lt"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_lt"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_lt"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_mul"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_mul"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_mul"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_mul"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_ne"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_ne"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_ne"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_ne"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_negative_inner_product"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_negative_inner_product"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_negative_inner_product"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_negative_inner_product"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_spherical_distance"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_spherical_distance"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_spherical_distance"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_spherical_distance"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_sub"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_sub"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_sub"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_sub"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."hamming_distance"(bit, bit) TO "postgres";
GRANT ALL ON FUNCTION "public"."hamming_distance"(bit, bit) TO "anon";
GRANT ALL ON FUNCTION "public"."hamming_distance"(bit, bit) TO "authenticated";
GRANT ALL ON FUNCTION "public"."hamming_distance"(bit, bit) TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."hnsw_bit_support"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."hnsw_bit_support"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."hnsw_bit_support"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hnsw_bit_support"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."hnsw_halfvec_support"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."hnsw_halfvec_support"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."hnsw_halfvec_support"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hnsw_halfvec_support"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."hnsw_sparsevec_support"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."hnsw_sparsevec_support"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."hnsw_sparsevec_support"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hnsw_sparsevec_support"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."hnswhandler"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."hnswhandler"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."hnswhandler"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hnswhandler"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."inner_product"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."inner_product"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."inner_product"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."ivfflat_bit_support"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."ivfflat_bit_support"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."ivfflat_bit_support"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."ivfflat_bit_support"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."ivfflat_halfvec_support"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."ivfflat_halfvec_support"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."ivfflat_halfvec_support"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."ivfflat_halfvec_support"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."ivfflathandler"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."ivfflathandler"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."ivfflathandler"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."ivfflathandler"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."jaccard_distance"(bit, bit) TO "postgres";
GRANT ALL ON FUNCTION "public"."jaccard_distance"(bit, bit) TO "anon";
GRANT ALL ON FUNCTION "public"."jaccard_distance"(bit, bit) TO "authenticated";
GRANT ALL ON FUNCTION "public"."jaccard_distance"(bit, bit) TO "service_role";



GRANT ALL ON FUNCTION "public"."l1_distance"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l1_distance"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l1_distance"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_distance"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_distance"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_distance"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_norm"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_norm"("public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_cmp"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_cmp"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_cmp"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_cmp"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_eq"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_eq"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_eq"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_eq"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_ge"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_ge"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_ge"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_ge"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_gt"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_gt"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_gt"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_gt"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_l2_squared_distance"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_l2_squared_distance"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_l2_squared_distance"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_l2_squared_distance"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_le"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_le"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_le"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_le"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_lt"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_lt"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_lt"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_lt"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_ne"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_ne"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_ne"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_ne"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_negative_inner_product"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_negative_inner_product"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_negative_inner_product"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_negative_inner_product"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."subvector"("public"."halfvec", integer, integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."subvector"("public"."halfvec", integer, integer) TO "anon";
GRANT ALL ON FUNCTION "public"."subvector"("public"."halfvec", integer, integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."subvector"("public"."halfvec", integer, integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."subvector"("public"."vector", integer, integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."subvector"("public"."vector", integer, integer) TO "anon";
GRANT ALL ON FUNCTION "public"."subvector"("public"."vector", integer, integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."subvector"("public"."vector", integer, integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_votes_schema_to_local"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_votes_schema_to_local"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_votes_schema_to_local"() TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_accum"(double precision[], "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_accum"(double precision[], "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_accum"(double precision[], "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_accum"(double precision[], "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_add"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_add"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_add"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_add"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_avg"(double precision[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_avg"(double precision[]) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_avg"(double precision[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_avg"(double precision[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_cmp"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_cmp"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_cmp"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_cmp"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_combine"(double precision[], double precision[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_combine"(double precision[], double precision[]) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_combine"(double precision[], double precision[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_combine"(double precision[], double precision[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_concat"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_concat"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_concat"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_concat"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_dims"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_dims"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_eq"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_eq"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_eq"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_eq"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_ge"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_ge"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_ge"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_ge"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_gt"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_gt"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_gt"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_gt"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_l2_squared_distance"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_l2_squared_distance"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_l2_squared_distance"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_l2_squared_distance"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_le"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_le"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_le"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_le"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_lt"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_lt"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_lt"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_lt"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_mul"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_mul"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_mul"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_mul"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_ne"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_ne"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_ne"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_ne"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_negative_inner_product"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_negative_inner_product"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_negative_inner_product"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_negative_inner_product"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_norm"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_norm"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_norm"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_norm"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_spherical_distance"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_spherical_distance"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_spherical_distance"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_spherical_distance"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_sub"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_sub"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_sub"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_sub"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."avg"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."avg"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."avg"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."avg"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."avg"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."avg"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."avg"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."avg"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."sum"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sum"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."sum"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sum"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sum"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."sum"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."sum"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sum"("public"."vector") TO "service_role";
























GRANT ALL ON TABLE "public"."anomalies" TO "anon";
GRANT ALL ON TABLE "public"."anomalies" TO "authenticated";
GRANT ALL ON TABLE "public"."anomalies" TO "service_role";



GRANT ALL ON SEQUENCE "public"."anomalies_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."anomalies_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."anomalies_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."classifications" TO "anon";
GRANT ALL ON TABLE "public"."classifications" TO "authenticated";
GRANT ALL ON TABLE "public"."classifications" TO "service_role";



GRANT ALL ON SEQUENCE "public"."classifications_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."classifications_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."classifications_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."comments" TO "anon";
GRANT ALL ON TABLE "public"."comments" TO "authenticated";
GRANT ALL ON TABLE "public"."comments" TO "service_role";



GRANT ALL ON SEQUENCE "public"."comments_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."comments_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."comments_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."events" TO "anon";
GRANT ALL ON TABLE "public"."events" TO "authenticated";
GRANT ALL ON TABLE "public"."events" TO "service_role";



GRANT ALL ON SEQUENCE "public"."events_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."events_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."events_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."inventory" TO "anon";
GRANT ALL ON TABLE "public"."inventory" TO "authenticated";
GRANT ALL ON TABLE "public"."inventory" TO "service_role";



GRANT ALL ON SEQUENCE "public"."inventory_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."inventory_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."inventory_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."linked_anomalies" TO "anon";
GRANT ALL ON TABLE "public"."linked_anomalies" TO "authenticated";
GRANT ALL ON TABLE "public"."linked_anomalies" TO "service_role";



GRANT ALL ON SEQUENCE "public"."linked_anomalies_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."linked_anomalies_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."linked_anomalies_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."mineralDeposits" TO "anon";
GRANT ALL ON TABLE "public"."mineralDeposits" TO "authenticated";
GRANT ALL ON TABLE "public"."mineralDeposits" TO "service_role";



GRANT ALL ON SEQUENCE "public"."mineralDeposits_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."mineralDeposits_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."mineralDeposits_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."missions" TO "anon";
GRANT ALL ON TABLE "public"."missions" TO "authenticated";
GRANT ALL ON TABLE "public"."missions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."missions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."missions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."missions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."notification_rejections" TO "anon";
GRANT ALL ON TABLE "public"."notification_rejections" TO "authenticated";
GRANT ALL ON TABLE "public"."notification_rejections" TO "service_role";



GRANT ALL ON TABLE "public"."nps_surveys" TO "anon";
GRANT ALL ON TABLE "public"."nps_surveys" TO "authenticated";
GRANT ALL ON TABLE "public"."nps_surveys" TO "service_role";



GRANT ALL ON TABLE "public"."nps_analytics" TO "anon";
GRANT ALL ON TABLE "public"."nps_analytics" TO "authenticated";
GRANT ALL ON TABLE "public"."nps_analytics" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."push_anomaly_log" TO "anon";
GRANT ALL ON TABLE "public"."push_anomaly_log" TO "authenticated";
GRANT ALL ON TABLE "public"."push_anomaly_log" TO "service_role";



GRANT ALL ON TABLE "public"."push_subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."push_subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."push_subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."referrals" TO "anon";
GRANT ALL ON TABLE "public"."referrals" TO "authenticated";
GRANT ALL ON TABLE "public"."referrals" TO "service_role";



GRANT ALL ON TABLE "public"."researched" TO "anon";
GRANT ALL ON TABLE "public"."researched" TO "authenticated";
GRANT ALL ON TABLE "public"."researched" TO "service_role";



GRANT ALL ON SEQUENCE "public"."researched_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."researched_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."researched_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."routes" TO "anon";
GRANT ALL ON TABLE "public"."routes" TO "authenticated";
GRANT ALL ON TABLE "public"."routes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."routes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."routes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."routes_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."sectors" TO "anon";
GRANT ALL ON TABLE "public"."sectors" TO "authenticated";
GRANT ALL ON TABLE "public"."sectors" TO "service_role";



GRANT ALL ON SEQUENCE "public"."sectors_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."sectors_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."sectors_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."unlocked_technologies" TO "anon";
GRANT ALL ON TABLE "public"."unlocked_technologies" TO "authenticated";
GRANT ALL ON TABLE "public"."unlocked_technologies" TO "service_role";



GRANT ALL ON SEQUENCE "public"."unlocked_technologies_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."unlocked_technologies_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."unlocked_technologies_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."uploads" TO "anon";
GRANT ALL ON TABLE "public"."uploads" TO "authenticated";
GRANT ALL ON TABLE "public"."uploads" TO "service_role";



GRANT ALL ON SEQUENCE "public"."uploads_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."uploads_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."uploads_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_anomalies" TO "anon";
GRANT ALL ON TABLE "public"."user_anomalies" TO "authenticated";
GRANT ALL ON TABLE "public"."user_anomalies" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_anomalies_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_anomalies_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_anomalies_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."votes" TO "anon";
GRANT ALL ON TABLE "public"."votes" TO "authenticated";
GRANT ALL ON TABLE "public"."votes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."votes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."votes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."votes_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."zoo" TO "anon";
GRANT ALL ON TABLE "public"."zoo" TO "authenticated";
GRANT ALL ON TABLE "public"."zoo" TO "service_role";



GRANT ALL ON SEQUENCE "public"."zoo_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."zoo_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."zoo_id_seq" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
