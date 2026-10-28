SELECT id, slug, title, note, summary, body, image, location, date, day, weeks, start_time, end_time, status, created_at, updated_at
FROM events
ORDER BY day NULLS LAST, date, start_time;
