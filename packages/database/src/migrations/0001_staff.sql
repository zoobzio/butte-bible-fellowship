-- Whether a piece of content reaches the site. Draft is being written,
-- published is live, and archived is kept but no longer shown: what the
-- staff share with every kind of content the admin app will edit.
CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived');

-- Someone who serves the church: an elder, a pastor, the office.
CREATE TABLE staff (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  -- What names them in an address: `/staff/<slug>`.
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  -- What they do: Elder, Pastor, Office Administrator.
  role text NOT NULL,
  -- A line or two about them, as a card shows.
  summary text,
  -- Their bio in full, as Markdown, for their own page.
  bio text,
  -- The URL of their photo.
  photo text,
  -- How the public reaches them, where they offer it.
  email text,
  phone text,
  -- Where they stand in the list, lowest first.
  position int2 NOT NULL DEFAULT 0,
  -- Only the published reach the site.
  status content_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- The site lists the published, in order.
CREATE INDEX staff_published ON staff (position, name) WHERE status = 'published';
