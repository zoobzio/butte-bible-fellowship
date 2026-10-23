-- The site: reads, and nothing else. Every web query filters to the
-- published rows itself, so the role reads whole tables; what it may never
-- do is write one.
GRANT SELECT ON staff, events, sermons TO web;
