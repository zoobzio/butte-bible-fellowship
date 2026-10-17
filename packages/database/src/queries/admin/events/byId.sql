SELECT id, slug, title, note, location, date, day, weeks, start_time, end_time, created_at, updated_at
FROM events
WHERE id = :id;
