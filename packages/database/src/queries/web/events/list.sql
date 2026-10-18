-- The calendar's events: every published one that is still to come — the
-- repeating ones, Sunday first, then the one-offs on or after a date,
-- soonest first. What is written about an event is its own page's to carry.
SELECT slug, title, note, summary, image, location, date, day, weeks, start_time, end_time
FROM events
WHERE status = 'published' AND (date IS NULL OR date >= :from::date)
ORDER BY day NULLS LAST, date, start_time;
