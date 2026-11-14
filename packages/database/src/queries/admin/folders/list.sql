-- The folders inside one, or at the top when none is named, by name: each
-- with how many folders and pages it holds itself.
SELECT id, parent_id, name, created_at, updated_at,
  (
    (SELECT count(*) FROM folders AS held WHERE held.parent_id = folders.id)
    + (SELECT count(*) FROM content WHERE content.folder_id = folders.id)
  )::int AS count
FROM folders
WHERE parent_id IS NOT DISTINCT FROM :parent_id::bigint
ORDER BY name, id;
