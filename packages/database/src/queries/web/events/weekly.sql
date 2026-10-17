-- The events page's calendar: every repeating event, Sunday first, then by
-- when it starts.
SELECT slug, title, note, location, day, weeks, start_time, end_time
FROM events
WHERE day IS NOT NULL
ORDER BY day, start_time;
