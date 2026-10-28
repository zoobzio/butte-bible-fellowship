CREATE TABLE sermons (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  speaker text,
  summary text,
  body text,
  image text,
  -- YouTube video id, not a URL.
  video text UNIQUE,
  date date NOT NULL,
  status content_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX sermons_published ON sermons (date DESC, created_at DESC)
  WHERE status = 'published';
