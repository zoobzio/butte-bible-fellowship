-- What the admin's lists have been through: a count for each list that
-- keeps itself up to date, one more with every statement that writes to
-- what the list shows. A list read beside its count can be asked later
-- whether it still stands, by the count alone: the same, nothing was
-- added, changed or removed. A row removed leaves nothing behind to be
-- found newer than a date, which is why the count is kept and no date is
-- compared. `surface` names the list, as a view's does.
CREATE TABLE changes (
  surface text PRIMARY KEY CHECK (surface <> ''),
  version bigint NOT NULL DEFAULT 0
);

INSERT INTO changes (surface) VALUES ('people'), ('content');

-- A write to a list's table, counted against the list the trigger names.
-- Once a statement, however many rows it touched.
CREATE FUNCTION changes_counted() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  UPDATE changes SET version = version + 1 WHERE surface = TG_ARGV[0];
  RETURN NULL;
END;
$$;

CREATE TRIGGER people_counted
AFTER INSERT OR UPDATE OR DELETE ON people
FOR EACH STATEMENT EXECUTE FUNCTION changes_counted('people');

-- The content's list is its documents and its folders together.
CREATE TRIGGER content_counted
AFTER INSERT OR UPDATE OR DELETE ON content
FOR EACH STATEMENT EXECUTE FUNCTION changes_counted('content');

CREATE TRIGGER folders_counted
AFTER INSERT OR UPDATE OR DELETE ON folders
FOR EACH STATEMENT EXECUTE FUNCTION changes_counted('content');
