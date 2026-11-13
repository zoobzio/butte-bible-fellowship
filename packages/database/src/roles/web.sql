-- Each web query of the sermons must filter to published rows; the staff,
-- the events and the content carry no status, and are all read.
GRANT SELECT ON staff, events, sermons, content TO web;
