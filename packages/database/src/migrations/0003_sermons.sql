-- A sermon preached at the church. What is written about it is its own page,
-- `/sermons/<slug>`; its recording, when it has one, is a video on the
-- church's YouTube channel, which the admin app reads the channel's feed for.
CREATE TABLE sermons (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  -- What the sermon's own page is called in its address: `/sermons/<slug>`.
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  -- Who preached it, by name: one of the staff, or a guest.
  speaker text,
  -- A line or two about it, as a card shows and search engines list.
  summary text,
  -- What is written about it, as Markdown, for its own page.
  body text,
  -- The URL of its picture. Null is pictured by its video's thumbnail.
  image text,
  -- YouTube's id for its recording: what its watch and embed URLs carry.
  -- Null is not recorded, or not yet.
  video text UNIQUE,
  -- The day it was preached.
  date date NOT NULL,
  -- Only the published reach the site.
  status content_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- The site lists the published, newest first.
CREATE INDEX sermons_published ON sermons (date DESC, created_at DESC)
  WHERE status = 'published';
