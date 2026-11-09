-- The calendar's feed: every recurring event by its day of the week, Sunday
-- first, then the one-offs on or after a date.
SELECT slug, title, summary, image, date, recurring, weeks, start_time, end_time
FROM events
WHERE recurring OR date >= :from::date
ORDER BY recurring DESC,
  CASE WHEN recurring THEN extract(dow FROM date) END,
  CASE WHEN NOT recurring THEN date END,
  start_time;
