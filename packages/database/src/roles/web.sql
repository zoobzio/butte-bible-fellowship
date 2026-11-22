-- Each web query of the sermons must filter to published rows; the events,
-- the content and the pages with a table of their own carry no status, and
-- are all read, as is how the site looks.
GRANT SELECT ON events, sermons, content, home, about, connect, appearance TO web;

-- Of the people, the site reads what it shows of those who serve the
-- church, and no more: where a person lives and the day they were born are
-- columns it may not read, whoever they are.
-- Its query filters to the staff; the members are not the site's to list.
GRANT SELECT (id, first_name, last_name, name, role, title, summary, bio, photo, email, phone)
  ON people TO web;
