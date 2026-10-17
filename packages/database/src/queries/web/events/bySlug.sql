-- An event's own page, `/events/<slug>`.
SELECT slug, title, note, location, date, day, weeks, start_time, end_time
FROM events
WHERE slug = :slug;
