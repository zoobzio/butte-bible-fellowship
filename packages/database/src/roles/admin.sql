-- The admin app: the full set of reads and writes over the content tables.
-- Each id is an identity column, which Postgres fills without a privilege
-- on its sequence, so the tables are the whole of the grant.
GRANT SELECT, INSERT, UPDATE, DELETE ON staff, events, sermons TO admin;
