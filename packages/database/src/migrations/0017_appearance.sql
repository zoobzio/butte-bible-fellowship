-- How the site looks, over what its theme says: a table of one row, as
-- the pages with a layout of their own have. The theme the site is built
-- with holds the defaults; what is set here overrides them without a
-- deployment, and only while that theme is the one applied. `seeds` is
-- what the admin sets: a color for each ramp of the palette it changes,
-- by the ramp's name. `patch` is what the site applies: the overrides of
-- the theme's tokens those seeds come to, in the shape the theme's
-- runtime takes them. `input` is the context of each modifier — the color
-- scheme, the contrast, the text size and the rest — a visitor starts
-- with, for each one the admin sets, until they choose their own. The
-- shape of all three is the theme's, and so is checked where it is
-- written and where it is applied, and not here. The row is made here,
-- empty: the site is as its theme says until the admin says otherwise.
CREATE TABLE appearance (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  seeds jsonb NOT NULL DEFAULT '{}',
  patch jsonb NOT NULL DEFAULT '{}',
  input jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO appearance DEFAULT VALUES;
