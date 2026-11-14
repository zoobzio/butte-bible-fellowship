-- Moves a folder into another, or to the top when none is named: never
-- into itself, nor into a folder under it, which would cut it loose from
-- the top. The folders from the one it is moved into up to the top are the
-- ones it must not be among.
WITH RECURSIVE above AS (
  SELECT id, parent_id FROM folders WHERE id = :parent_id::bigint
  UNION ALL
  SELECT folders.id, folders.parent_id
  FROM folders
  JOIN above ON folders.id = above.parent_id
)
UPDATE folders
SET parent_id = :parent_id::bigint,
    updated_at = now()
WHERE id = :id
  AND NOT EXISTS (SELECT 1 FROM above WHERE above.id = :id)
RETURNING id, updated_at;
