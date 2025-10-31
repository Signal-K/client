-- Function to get or create the current week's solar event
CREATE OR REPLACE FUNCTION get_or_create_current_solar_event()
RETURNS solar_events AS $$
DECLARE
  current_week_start date;
  current_week_end date;
  event_record solar_events;
BEGIN
  -- Calculate current week start (Sunday)
  current_week_start := date_trunc('week', CURRENT_DATE)::date;
  current_week_end := current_week_start + INTERVAL '7 days';
  
  -- Try to get existing event for this week
  SELECT * INTO event_record
  FROM solar_events
  WHERE week_start = current_week_start
  LIMIT 1;
  
  -- If no event exists, create one
  IF NOT FOUND THEN
    INSERT INTO solar_events (week_start, week_end, was_defended)
    VALUES (current_week_start, current_week_end::date, false)
    RETURNING * INTO event_record;
  END IF;
  
  RETURN event_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current event should be marked as defended
CREATE OR REPLACE FUNCTION check_and_update_solar_defense()
RETURNS void AS $$
DECLARE
  current_event solar_events;
  total_classifications bigint;
  total_probes bigint;
  total_progress bigint;
  defense_threshold integer := 100;
BEGIN
  -- Get current event
  SELECT * INTO current_event
  FROM solar_events
  WHERE week_end >= CURRENT_DATE
  ORDER BY week_start DESC
  LIMIT 1;
  
  IF FOUND AND NOT current_event.was_defended THEN
    -- Count classifications this week
    SELECT COUNT(*) INTO total_classifications
    FROM classifications
    WHERE classificationtype = 'sunspot'
    AND created_at >= current_event.week_start;
    
    -- Count probes
    SELECT COALESCE(SUM(count), 0) INTO total_probes
    FROM defensive_probes
    WHERE event_id = current_event.id;
    
    -- Calculate total progress
    total_progress := total_classifications + total_probes;
    
    -- Update defense status if threshold met
    IF total_progress >= defense_threshold THEN
      UPDATE solar_events
      SET was_defended = true
      WHERE id = current_event.id;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get community progress for current event
CREATE OR REPLACE FUNCTION get_solar_event_progress(event_uuid uuid, user_uuid uuid DEFAULT NULL)
RETURNS TABLE (
  total_classifications bigint,
  total_probes bigint,
  user_classifications bigint,
  user_probes bigint,
  threshold integer,
  percent_complete numeric
) AS $$
DECLARE
  event_start date;
  defense_threshold integer := 100;
BEGIN
  -- Get event start date
  SELECT week_start INTO event_start
  FROM solar_events
  WHERE id = event_uuid;
  
  -- Count total classifications
  SELECT COUNT(*) INTO total_classifications
  FROM classifications
  WHERE classificationtype = 'sunspot'
  AND created_at >= event_start;
  
  -- Count total probes
  SELECT COALESCE(SUM(count), 0) INTO total_probes
  FROM defensive_probes
  WHERE event_id = event_uuid;
  
  -- If user specified, get their stats
  IF user_uuid IS NOT NULL THEN
    SELECT COUNT(*) INTO user_classifications
    FROM classifications
    WHERE classificationtype = 'sunspot'
    AND author = user_uuid
    AND created_at >= event_start;
    
    SELECT COALESCE(SUM(count), 0) INTO user_probes
    FROM defensive_probes
    WHERE event_id = event_uuid
    AND user_id = user_uuid;
  ELSE
    user_classifications := 0;
    user_probes := 0;
  END IF;
  
  -- Calculate completion percentage
  threshold := defense_threshold;
  percent_complete := LEAST(100, ((total_classifications + total_probes)::numeric / defense_threshold * 100));
  
  RETURN QUERY SELECT 
    total_classifications,
    total_probes,
    user_classifications,
    user_probes,
    threshold,
    percent_complete;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_or_create_current_solar_event() TO authenticated;
GRANT EXECUTE ON FUNCTION check_and_update_solar_defense() TO authenticated;
GRANT EXECUTE ON FUNCTION get_solar_event_progress(uuid, uuid) TO authenticated;
