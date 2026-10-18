-- The published one-off events on or after a date, soonest first.
SELECT slug, title, note, summary, image, location, date, start_time, end_time
FROM events
WHERE status = 'published' AND date IS NOT NULL AND date >= :from::date
ORDER BY date, start_time;
