-- Each web query of the events and the sermons must filter to published
-- rows; the staff carry no status, and are all read.
GRANT SELECT ON staff, events, sermons TO web;
