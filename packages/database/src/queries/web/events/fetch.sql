SELECT slug, title, note, summary, body, image, location, date, day, weeks, start_time, end_time
FROM events
WHERE slug = :slug AND status = 'published';
