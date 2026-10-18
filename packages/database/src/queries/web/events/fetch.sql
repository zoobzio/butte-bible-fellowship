-- An event's own page, `/events/<slug>`: only a published one is there, and
-- it alone carries what is written about the event.
SELECT slug, title, note, summary, body, image, location, date, day, weeks, start_time, end_time
FROM events
WHERE slug = :slug AND status = 'published';
