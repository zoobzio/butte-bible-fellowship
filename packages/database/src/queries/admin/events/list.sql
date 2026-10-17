-- Every event: the repeating ones first, Sunday onward, then the one-offs by
-- date.
SELECT id, slug, title, note, location, date, day, weeks, start_time, end_time, created_at, updated_at
FROM events
ORDER BY day NULLS LAST, date, start_time;
