-- The staff become the people: everyone the church keeps a row for, those
-- who serve it and those who belong to it alike. What was the staff's table
-- is the people's, and a row's role says which it is.
ALTER TABLE staff RENAME TO people;

-- A role more, for whoever belongs to the church and holds no office in it:
-- the role a person has until they are given another. The order is still
-- the order they are listed in, the members after those who serve. The type
-- is made afresh, not added to, so that the value can be used here, where
-- it is made.
CREATE TYPE person_role AS ENUM ('pastor', 'elder', 'staff', 'member');

DROP INDEX staff_order;

ALTER TABLE people
  ALTER COLUMN role TYPE person_role USING role::text::person_role,
  ALTER COLUMN role SET DEFAULT 'member';

DROP TYPE staff_role;

-- A name is written in its two parts, so the people can be put in order by
-- the last of them. What was one name is split at its last space: the last
-- word the last name, what comes before it the first, and a name of one
-- word a first name alone, its last left empty until it is written.
DROP INDEX staff_search;

ALTER TABLE people
  DROP COLUMN search,
  ADD COLUMN first_name text,
  ADD COLUMN last_name text;

UPDATE people
SET first_name = CASE WHEN btrim(name) ~ '\s'
      THEN regexp_replace(btrim(name), '\s+\S+$', '')
      ELSE btrim(name) END,
    last_name = CASE WHEN btrim(name) ~ '\s'
      THEN substring(btrim(name) FROM '\S+$')
      ELSE '' END;

ALTER TABLE people
  ALTER COLUMN first_name SET NOT NULL,
  ALTER COLUMN last_name SET NOT NULL,
  DROP COLUMN name;

-- The name in full is still a column, which the database keeps in step
-- with its parts: what a card, a heading and the search read.
ALTER TABLE people ADD COLUMN name text
  GENERATED ALWAYS AS (btrim(first_name || ' ' || last_name)) STORED;

-- What more is kept of a person: what they are called for what they do, as
-- the site may say in place of their role; where they live, a line of text
-- to a line of the address; and the day they were born. Neither of the last
-- two is the site's to read.
ALTER TABLE people
  ADD COLUMN title text,
  ADD COLUMN address text,
  ADD COLUMN birthday date;

-- What the free text is looked for in, as it was, with the title and the
-- address beside the rest.
ALTER TABLE people ADD COLUMN search text
  GENERATED ALWAYS AS (
    btrim(first_name || ' ' || last_name)
      || coalesce(' ' || email, '')
      || coalesce(' ' || phone, '')
      || coalesce(' ' || title, '')
      || coalesce(' ' || summary, '')
      || coalesce(' ' || address, '')
      || coalesce(' ' || hast_text(bio), '')
  ) STORED;

CREATE INDEX people_search ON people USING gin (search gin_trgm_ops);

-- The order the people are listed in: by role, then by last name, then by
-- first.
CREATE INDEX people_order ON people (role, last_name, first_name);

-- A view saved of the staff's list is a view of the people's.
UPDATE views SET surface = 'people' WHERE surface = 'staff';
