-- Each web query of the sermons must filter to published rows; the staff,
-- the events, the content and the pages with a table of their own carry no
-- status, and are all read.
GRANT SELECT ON staff, events, sermons, content, home, about, connect TO web;
