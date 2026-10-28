CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived');

CREATE TABLE staff (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  role text NOT NULL,
  summary text,
  bio text,
  photo text,
  email text,
  phone text,
  position int2 NOT NULL DEFAULT 0,
  status content_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX staff_published ON staff (position, name) WHERE status = 'published';
