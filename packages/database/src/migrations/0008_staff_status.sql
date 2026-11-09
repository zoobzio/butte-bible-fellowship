-- A member carries no status: whoever is on the staff is on the site. The
-- index that served the site's list of the published goes with the column,
-- and one over every member serves the list in its place.
DROP INDEX staff_published;

ALTER TABLE staff DROP COLUMN status;

CREATE INDEX staff_order ON staff (role, name);
