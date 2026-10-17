-- The one-off events on or after a date, soonest first.
SELECT slug, title, note, location, date, start_time, end_time
FROM events
WHERE date IS NOT NULL AND date >= :from::date
ORDER BY date, start_time;
