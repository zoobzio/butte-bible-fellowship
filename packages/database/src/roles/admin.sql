-- Identity columns need no sequence grant.
GRANT SELECT, INSERT, UPDATE, DELETE ON people, events, sermons, users, content, folders, views TO admin;

-- A page with a table of its own is one row, made with the table: it is
-- read and changed, and neither added nor removed.
GRANT SELECT, UPDATE ON home, about, connect TO admin;

-- How the site looks is one row too, made with its table.
GRANT SELECT, UPDATE ON appearance TO admin;

-- The count of a list's writes is read beside the list, and kept by the
-- triggers of the tables it is of, which run as whoever wrote.
GRANT SELECT, UPDATE ON changes TO admin;
