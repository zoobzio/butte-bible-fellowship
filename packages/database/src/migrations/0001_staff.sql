CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived');

-- In the order the site lists them.
CREATE TYPE staff_role AS ENUM ('pastor', 'elder', 'staff');

CREATE TABLE staff (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL,
  role staff_role NOT NULL,
  summary text,
  -- Rich text, as the HTML tree (hast) the app renders.
  bio jsonb,
  photo text,
  email text,
  phone text,
  status content_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX staff_published ON staff (role, name) WHERE status = 'published';
