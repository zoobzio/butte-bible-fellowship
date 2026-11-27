-- The sermons are a list the admin keeps up to date too: a count of their
-- own beside the people's and the content's, one more with every statement
-- that writes to them, a sync from the church's YouTube channel among them.
INSERT INTO changes (surface) VALUES ('sermons');

CREATE TRIGGER sermons_counted
AFTER INSERT OR UPDATE OR DELETE ON sermons
FOR EACH STATEMENT EXECUTE FUNCTION changes_counted('sermons');

-- A batch of the sermons is read from the one before it, by the day each
-- was preached and then its id, the latest first.
CREATE INDEX sermons_latest ON sermons (date DESC, id DESC);
