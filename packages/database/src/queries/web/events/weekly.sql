-- The week's calendar: every published repeating event, Sunday first, then
-- by when it starts.
SELECT slug, title, note, summary, image, location, day, weeks, start_time, end_time
FROM events
WHERE status = 'published' AND day IS NOT NULL
ORDER BY day, start_time;
