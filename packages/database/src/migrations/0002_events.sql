-- The days of the week an event can repeat on, Sunday first.
CREATE TYPE event_day AS ENUM (
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday'
);

-- An event of the church. One with a date happens once, on that date; one
-- with a day instead repeats every week on that day. Its times are the
-- church's own. What is written about it is its own page, `/events/<slug>`.
CREATE TABLE events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  -- What the event's own page is called in its address: `/events/<slug>`.
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  -- A few words more about it, shown under its title in a list.
  note text,
  -- A line or two about it, as a card shows and search engines list.
  summary text,
  -- What is written about it, as Markdown, for its own page.
  body text,
  -- The URL of its picture. Null is pictured by the church.
  image text,
  -- Where it is held, when that is not at the church.
  location text,
  -- The one date it happens on.
  date date,
  -- The day of the week it repeats on.
  day event_day,
  -- Which of the month's weeks a repeating event is held in: {1, 3} is the
  -- first and third. Null is every week.
  weeks int2[],
  start_time time NOT NULL,
  end_time time,
  -- Only the published reach the site.
  status content_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  -- An event happens once or repeats, never both and never neither.
  CONSTRAINT events_date_or_day CHECK ((date IS NULL) <> (day IS NULL)),
  -- Only a repeating event picks its weeks.
  CONSTRAINT events_weeks_repeat CHECK (weeks IS NULL OR day IS NOT NULL),
  CONSTRAINT events_weeks_range CHECK (weeks IS NULL OR weeks <@ ARRAY[1, 2, 3, 4, 5]::int2[]),
  CONSTRAINT events_end_after_start CHECK (end_time IS NULL OR end_time > start_time)
);

-- The site lists the published: the repeating ones Sunday first, and the
-- one-offs still to come, soonest first.
CREATE INDEX events_published_weekly ON events (day, start_time)
  WHERE status = 'published' AND day IS NOT NULL;
CREATE INDEX events_published_upcoming ON events (date, start_time)
  WHERE status = 'published' AND date IS NOT NULL;
