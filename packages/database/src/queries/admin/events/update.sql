-- Replaces every field, the kind of the event with them: a date makes it a
-- one-off, a day makes it weekly.
UPDATE events
SET slug = :slug,
    title = :title,
    note = :note,
    location = :location,
    date = :date::date,
    day = :day,
    weeks = :weeks::int2[],
    start_time = :start::time,
    end_time = :end::time,
    updated_at = now()
WHERE id = :id
RETURNING id, slug, updated_at;
