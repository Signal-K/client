-- Migration: migrate user_anomalies data into linked_anomalies + drop table
-- user_anomalies (54 remote rows) is superseded by linked_anomalies.
-- Maps: user_id → author, anomaly_id → anomaly_id, ownership_date → date.
-- Uses the earliest ownership_date per (user_id, anomaly_id) pair to deduplicate.
-- FK guards ensure no orphan rows are inserted.
-- automaton = 'historical' marks these as migrated legacy records.

INSERT INTO public.linked_anomalies (author, anomaly_id, date, automaton)
SELECT
  ua.user_id,
  ua.anomaly_id,
  MIN(ua.ownership_date) AS date,
  'historical' AS automaton
FROM public.user_anomalies ua
WHERE EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = ua.user_id)
  AND EXISTS (SELECT 1 FROM public.anomalies a WHERE a.id = ua.anomaly_id)
GROUP BY ua.user_id, ua.anomaly_id;

-- Data fully migrated; safe to drop.
DROP TABLE IF EXISTS public.user_anomalies;
DROP SEQUENCE IF EXISTS public.user_anomalies_id_seq;
