SELECT slug, title, summary, body, image, date, recurring, weeks, start_time, end_time
FROM events
WHERE slug = :slug;
