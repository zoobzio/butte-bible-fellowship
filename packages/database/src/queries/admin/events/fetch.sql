SELECT id, slug, title, summary, body, image, date, recurring, weeks, start_time, end_time, created_at, updated_at
FROM events
WHERE id = :id;
