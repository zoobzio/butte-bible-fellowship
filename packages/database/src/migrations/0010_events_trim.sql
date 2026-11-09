-- An event, trimmed to what its form writes. It is held on a date, and a
-- recurring one every week on that date's day of the week: the day is the
-- date's own, so it is kept nowhere else. An event carries no status,
-- whatever is written is on the site, and neither a note nor a location.
-- What is written about it is rich text, the tree the admin's editor
-- writes, as a member's bio is.

-- The day of the week a date falls on.
CREATE FUNCTION event_day_of(held date) RETURNS event_day
LANGUAGE sql IMMUTABLE STRICT PARALLEL SAFE
AS $$
  SELECT (enum_range(NULL::event_day))[extract(dow FROM held)::int + 1]
$$;

-- Plain text as rich text (hast): a paragraph for each run of lines a
-- blank line sets apart; null for none. What was written as Markdown is
-- kept as its text: its marks are not read.
CREATE FUNCTION hast_paragraphs(written text) RETURNS jsonb
LANGUAGE sql IMMUTABLE STRICT PARALLEL SAFE
AS $$
  SELECT CASE WHEN count(*) = 0 THEN NULL ELSE jsonb_build_object(
    'type', 'root',
    'children', jsonb_agg(
      jsonb_build_object(
        'type', 'element',
        'tagName', 'p',
        'properties', '{}'::jsonb,
        'children', jsonb_build_array(jsonb_build_object(
          'type', 'text',
          'value', regexp_replace(btrim(part), '[[:space:]]+', ' ', 'g')
        ))
      ) ORDER BY ordinal
    )
  ) END
  FROM regexp_split_to_table(written, '\n[[:space:]]*\n') WITH ORDINALITY AS parts (part, ordinal)
  WHERE btrim(part) <> ''
$$;

DROP INDEX events_published_weekly;
DROP INDEX events_published_upcoming;
DROP INDEX events_search;
ALTER TABLE events DROP COLUMN search;

-- The rules of a date or a day go first: a repeating event is about to
-- hold both, until its day is dropped.
ALTER TABLE events DROP CONSTRAINT events_date_or_day;
ALTER TABLE events DROP CONSTRAINT events_weeks_repeat;

-- A repeating event takes a date for its day: the first of that day on or
-- after the day its row was written.
ALTER TABLE events ADD COLUMN recurring boolean NOT NULL DEFAULT false;

UPDATE events
SET recurring = true,
    date = created_at::date + (
      (array_position(enum_range(NULL::event_day), day) - 1
        - extract(dow FROM created_at::date)::int + 7) % 7
    )
WHERE day IS NOT NULL;

ALTER TABLE events ALTER COLUMN date SET NOT NULL;
ALTER TABLE events DROP COLUMN day;
ALTER TABLE events DROP COLUMN status;
ALTER TABLE events DROP COLUMN note;
ALTER TABLE events DROP COLUMN location;
ALTER TABLE events
  ADD CONSTRAINT events_weeks_recur CHECK (weeks IS NULL OR recurring);

ALTER TABLE events ADD COLUMN article jsonb;
UPDATE events SET article = hast_paragraphs(body);
ALTER TABLE events DROP COLUMN body;
ALTER TABLE events RENAME COLUMN article TO body;

-- What the site reads: the recurring events by day and start, and the
-- one-offs by date.
CREATE INDEX events_held ON events (recurring, date, start_time);

-- What the admin's free text is looked for in: the title, the slug, the
-- summary and what is written about it, as one text the database keeps in
-- step with them.
ALTER TABLE events ADD COLUMN search text
  GENERATED ALWAYS AS (
    title
      || ' ' || slug
      || coalesce(' ' || summary, '')
      || coalesce(' ' || hast_text(body), '')
  ) STORED;

CREATE INDEX events_search ON events USING gin (search gin_trgm_ops);
