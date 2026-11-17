-- The content is documents of every kind, a static asset of the site as
-- much as a page written in the admin, and what kind one is, is its media
-- type (its MIME type), lowercase, as it would be served: nothing else
-- says so, and no list of kinds is kept. An article, the rich text the
-- admin's editor writes as a tree, is the site's own type, which is what
-- every page written until now is, and what a document is made as when
-- nothing names another.
ALTER TABLE content
  ADD COLUMN mime text NOT NULL DEFAULT 'application/vnd.bbf.article+json'
  CONSTRAINT content_mime_check CHECK (
    mime ~ '^[a-z0-9][a-z0-9!#$&^_.+-]*/[a-z0-9][a-z0-9!#$&^_.+-]*$'
  );

-- How much a document holds, in bytes. It is written with what the
-- document holds, by whatever writes that, as each kind measures itself:
-- an article is the bytes of its body as text, and none while it has no
-- body.
ALTER TABLE content
  ADD COLUMN size bigint NOT NULL DEFAULT 0 CHECK (size >= 0);

UPDATE content SET size = coalesce(octet_length(body::text), 0);

-- What a folder comes to, kept on its row so that a listing reads it and
-- walks nothing: `size`, the bytes of every document under it, however
-- deep; `count`, how many folders and documents it holds itself; and its
-- `updated_at`, which is from here on when it, or anything under it, was
-- last changed. Each write of a document or a folder brings the folders
-- above it up to date, one row to a level of its depth, whatever the
-- content holds.
ALTER TABLE folders
  ADD COLUMN size bigint NOT NULL DEFAULT 0 CHECK (size >= 0);

ALTER TABLE folders
  ADD COLUMN count int NOT NULL DEFAULT 0 CHECK (count >= 0);

-- The folders as they stand, each from all that is under it: read once,
-- here, and never again.
WITH RECURSIVE under AS (
  SELECT id AS top, id, updated_at FROM folders
  UNION ALL
  SELECT under.top, folders.id, folders.updated_at
  FROM folders
  JOIN under ON folders.parent_id = under.id
),
held AS (
  SELECT under.top,
    coalesce(sum(content.size), 0)::bigint AS size,
    max(greatest(under.updated_at, content.updated_at)) AS updated_at
  FROM under
  LEFT JOIN content ON content.folder_id = under.id
  GROUP BY under.top
)
UPDATE folders
SET size = held.size,
    updated_at = held.updated_at,
    count = (
      (SELECT count(*) FROM folders AS inside WHERE inside.parent_id = folders.id)
      + (SELECT count(*) FROM content WHERE content.folder_id = folders.id)
    )::int
FROM held
WHERE held.top = folders.id;

-- A change under a folder, carried to it and to every folder above it:
-- `bytes` more, or fewer, and changed now. `entries` is how many more, or
-- fewer, the folder holds itself, which is no business of those above it.
-- Under no folder, at the top, there is nothing to carry it to.
CREATE FUNCTION folders_carry(held bigint, bytes bigint, entries int)
RETURNS void
LANGUAGE sql AS $$
  WITH RECURSIVE above AS (
    SELECT id, parent_id FROM folders WHERE id = held
    UNION ALL
    SELECT folders.id, folders.parent_id
    FROM folders
    JOIN above ON folders.id = above.parent_id
  )
  UPDATE folders
  SET size = folders.size + bytes,
      count = folders.count + CASE WHEN folders.id = held THEN entries ELSE 0 END,
      updated_at = now()
  WHERE folders.id IN (SELECT id FROM above);
$$;

-- A document written, filed elsewhere or removed: the folder it was in
-- gives up what it held, and the one it is in takes it on. Where it is
-- filed is all that changed of a document moved, and its folders are
-- changed by it all the same.
CREATE FUNCTION content_carried() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM folders_carry(NEW.folder_id, NEW.size, 1);
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM folders_carry(OLD.folder_id, -OLD.size, -1);
  ELSIF NEW.folder_id IS DISTINCT FROM OLD.folder_id THEN
    PERFORM folders_carry(OLD.folder_id, -OLD.size, -1);
    PERFORM folders_carry(NEW.folder_id, NEW.size, 1);
  ELSE
    PERFORM folders_carry(NEW.folder_id, NEW.size - OLD.size, 0);
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER content_carried
AFTER INSERT OR UPDATE OR DELETE ON content
FOR EACH ROW EXECUTE FUNCTION content_carried();

-- A folder made, renamed, moved or removed, carried to the folders above
-- it the same way, all it holds with it when it moves. What `folders_carry`
-- writes of a folder is neither its name nor where it is, so it sets off
-- nothing here.
CREATE FUNCTION folders_carried() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM folders_carry(NEW.parent_id, NEW.size, 1);
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM folders_carry(OLD.parent_id, -OLD.size, -1);
  ELSIF NEW.parent_id IS DISTINCT FROM OLD.parent_id THEN
    PERFORM folders_carry(OLD.parent_id, -NEW.size, -1);
    PERFORM folders_carry(NEW.parent_id, NEW.size, 1);
  ELSE
    PERFORM folders_carry(NEW.parent_id, 0, 0);
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER folders_made
AFTER INSERT OR DELETE ON folders
FOR EACH ROW EXECUTE FUNCTION folders_carried();

CREATE TRIGGER folders_placed
AFTER UPDATE OF name, parent_id ON folders
FOR EACH ROW EXECUTE FUNCTION folders_carried();
