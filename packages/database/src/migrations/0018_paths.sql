-- The content is addressed by its path: the names of the folders from the
-- top down to one, and under the last of them a document's slug. A path is
-- what the admin's address and its API name a folder or a document by, so
-- each name must stand as one step of it, and a path must name one thing.

-- A folder's name is one step of a path: it holds none of what an address
-- reads as something else, the slash and the backslash, which part one
-- step from the next, the question mark, which ends the path, the hash,
-- which ends the address, and the percent sign, which encodes the rest;
-- and it is neither of the two names an address reads as "here" and "the
-- folder above".
ALTER TABLE folders
  ADD CONSTRAINT folders_name_step CHECK (
    name !~ '[/\\?#%]' AND name NOT IN ('.', '..')
  );

-- A folder and a document beside one another never share a name, the
-- document's being its slug: the path to it would name them both. A folder
-- named, or moved, to where a document already answers is refused as a
-- name already taken is.
CREATE FUNCTION folders_path() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM content
    WHERE content.folder_id IS NOT DISTINCT FROM NEW.parent_id
      AND content.slug = NEW.name
  ) THEN
    RAISE EXCEPTION 'a document beside the folder is already at "%"', NEW.name
      USING ERRCODE = 'unique_violation', CONSTRAINT = 'folders_path_taken';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER folders_path
BEFORE INSERT OR UPDATE OF name, parent_id ON folders
FOR EACH ROW EXECUTE FUNCTION folders_path();

-- And a document written, renamed or filed to where a folder already
-- answers is refused the same way.
CREATE FUNCTION content_path() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM folders
    WHERE folders.parent_id IS NOT DISTINCT FROM NEW.folder_id
      AND folders.name = NEW.slug
  ) THEN
    RAISE EXCEPTION 'a folder beside the document is already at "%"', NEW.slug
      USING ERRCODE = 'unique_violation', CONSTRAINT = 'content_path_taken';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER content_path
BEFORE INSERT OR UPDATE OF slug, folder_id ON content
FOR EACH ROW EXECUTE FUNCTION content_path();
