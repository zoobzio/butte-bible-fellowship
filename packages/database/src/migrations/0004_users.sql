-- What a user is in the admin, the roles of `@bbf/patents`: its claims
-- request names the same two, and the admin's tests hold them in step.
CREATE TYPE user_role AS ENUM ('admin', 'editor');

-- Someone who may sign in to the admin. A user is added by their email,
-- before they ever sign in; Google's subject is bound to them the first
-- time they do, with a verified email, and names them from then on.
CREATE TABLE users (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email text NOT NULL UNIQUE,
  -- Google's stable id for the account, once they have signed in.
  sub text UNIQUE,
  -- Their name and photo as Google last gave them.
  name text,
  picture text,
  role user_role NOT NULL DEFAULT 'editor',
  -- When they last signed in, or never.
  signed_in_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
