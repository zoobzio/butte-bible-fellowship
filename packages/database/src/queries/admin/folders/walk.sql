-- Walks a path of folder names from the top, one step to a name: `path` is
-- the names as a JSON array, the top's first. Each folder found is a row,
-- by how deep it is, from 1; the walk stops at the first name no folder
-- there has, so as many rows as there are names is the folder the path
-- names, and fewer is how far down it holds. A name is its own among the
-- folders beside it, so a step finds one folder or none.
WITH RECURSIVE walk AS (
  SELECT 0 AS depth, NULL::bigint AS id
  UNION ALL
  SELECT walk.depth + 1, folders.id
  FROM walk
  JOIN folders
    ON folders.parent_id IS NOT DISTINCT FROM walk.id
    AND folders.name = :path::jsonb ->> walk.depth
)
SELECT depth, id
FROM walk
WHERE depth > 0
ORDER BY depth;
