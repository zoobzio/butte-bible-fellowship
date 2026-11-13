-- The site's pages whose words are written in the admin, which were
-- Markdown in the repository, the home page and About Us: each named by
-- its slug, the home page `index`, with the title and the description its
-- front matter carried, and what is written on it. The body is rich text,
-- the tree the admin's editor writes, as an event's is, the site's own
-- blocks among its elements. A page carries no status: whatever is written
-- is on the site.
CREATE TABLE content (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  body jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- What the admin's free text is looked for in: the title, the slug, the
-- description and what is written on the page, as one text the database
-- keeps in step with them.
ALTER TABLE content ADD COLUMN search text
  GENERATED ALWAYS AS (
    title
      || ' ' || slug
      || coalesce(' ' || description, '')
      || coalesce(' ' || hast_text(body), '')
  ) STORED;

CREATE INDEX content_search ON content USING gin (search gin_trgm_ops);
