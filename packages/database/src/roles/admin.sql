-- Identity columns need no sequence grant.
GRANT SELECT, INSERT, UPDATE, DELETE ON staff, events, sermons, users, content TO admin;
