-- Someone who serves the church, as the contact page lists them.
CREATE TABLE staff (
  id serial PRIMARY KEY,
  -- What names them in an address: `/staff/<slug>`.
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  -- What they do: Elder, Pastor, Office Administrator.
  role text NOT NULL,
  -- A few words about them.
  bio text,
  -- The path of their photo, under the site's media.
  photo text,
  email text,
  -- Where they stand in the list, lowest first.
  position int2 NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
