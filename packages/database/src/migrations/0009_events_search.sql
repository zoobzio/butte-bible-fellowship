-- What the admin's free text is looked for in: an event's title, its slug,
-- its note, its summary, where it is held and what is written about it, as
-- one text the database keeps in step with them. The body is Markdown, and
-- is searched as it was written. A trigram index serves it, as it does the
-- staff's, so the substring match of ILIKE reads the index.
ALTER TABLE events ADD COLUMN search text
  GENERATED ALWAYS AS (
    title
      || ' ' || slug
      || coalesce(' ' || note, '')
      || coalesce(' ' || summary, '')
      || coalesce(' ' || location, '')
      || coalesce(' ' || body, '')
  ) STORED;

CREATE INDEX events_search ON events USING gin (search gin_trgm_ops);
