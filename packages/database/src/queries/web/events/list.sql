SELECT slug, title, note, summary, image, location, date, day, weeks, start_time, end_time
FROM events
WHERE status = 'published' AND (date IS NULL OR date >= :from::date)
ORDER BY day NULLS LAST, date, start_time;
