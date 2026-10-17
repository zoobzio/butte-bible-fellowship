-- A sermon on the church's YouTube channel, as its feed lists it.
CREATE TABLE sermons (
  -- YouTube's id for the sermon: what its watch and embed URLs carry.
  id text PRIMARY KEY,
  title text NOT NULL,
  -- When YouTube published it.
  published_at timestamptz NOT NULL,
  -- The URL of its thumbnail image.
  thumbnail text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- The sermons page lists them newest first.
CREATE INDEX sermons_published_at ON sermons (published_at DESC);
