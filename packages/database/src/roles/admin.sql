-- Identity columns need no sequence grant.
GRANT SELECT, INSERT, UPDATE, DELETE ON staff, events, sermons, users, content, folders TO admin;

-- A page with a table of its own is one row, made with the table: it is
-- read and changed, and neither added nor removed.
GRANT SELECT, UPDATE ON home, about TO admin;
