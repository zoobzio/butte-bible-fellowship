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
-- church's own.
CREATE TABLE events (
  id serial PRIMARY KEY,
  -- What the event's own page is called in its address: `/events/<slug>`.
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  -- A few words more about it, shown under its title.
  note text,
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
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  -- An event happens once or repeats, never both and never neither.
  CONSTRAINT events_date_or_day CHECK ((date IS NULL) <> (day IS NULL)),
  -- Only a repeating event picks its weeks.
  CONSTRAINT events_weeks_repeat CHECK (weeks IS NULL OR day IS NOT NULL),
  CONSTRAINT events_weeks_range CHECK (weeks IS NULL OR weeks <@ ARRAY[1, 2, 3, 4, 5]::int2[]),
  CONSTRAINT events_end_after_start CHECK (end_time IS NULL OR end_time > start_time)
);
