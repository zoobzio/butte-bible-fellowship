-- The admin's saved views: an arrangement of one of its lists — the sort,
-- the columns shown and their order and widths, the page's size, and the
-- search — saved under a name to come back to. One table serves every
-- list: `surface` names the list a view is over, `staff` the first, and
-- `payload` holds the arrangement as that list reads it, whose shape is
-- the surface's own and so is checked where it is written, by the schema
-- the admin's API keeps for the surface, and not here. A view is its
-- user's own, and goes when they do. Its id is made by whoever saves it,
-- before it is stored, so a save writes the row or replaces it.
CREATE TABLE views (
  id uuid PRIMARY KEY,
  user_id bigint NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  surface text NOT NULL CHECK (surface <> ''),
  name text NOT NULL CHECK (name <> ''),
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX views_owner ON views (user_id, surface);
