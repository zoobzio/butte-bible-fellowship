CREATE TYPE event_day AS ENUM (
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday'
);

CREATE TABLE events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  note text,
  summary text,
  body text,
  image text,
  location text,
  date date,
  day event_day,
  -- Null is every week.
  weeks int2[],
  start_time time NOT NULL,
  end_time time,
  status content_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT events_date_or_day CHECK ((date IS NULL) <> (day IS NULL)),
  CONSTRAINT events_weeks_repeat CHECK (weeks IS NULL OR day IS NOT NULL),
  CONSTRAINT events_weeks_range CHECK (weeks IS NULL OR weeks <@ ARRAY[1, 2, 3, 4, 5]::int2[]),
  CONSTRAINT events_end_after_start CHECK (end_time IS NULL OR end_time > start_time)
);

CREATE INDEX events_published_weekly ON events (day, start_time)
  WHERE status = 'published' AND day IS NOT NULL;
CREATE INDEX events_published_upcoming ON events (date, start_time)
  WHERE status = 'published' AND date IS NOT NULL;
