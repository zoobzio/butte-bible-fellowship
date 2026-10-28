CREATE TYPE user_role AS ENUM ('admin', 'editor');

CREATE TABLE users (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email text NOT NULL UNIQUE,
  sub text UNIQUE,
  name text,
  picture text,
  role user_role NOT NULL DEFAULT 'editor',
  signed_in_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
