-- The folders inside one, or at the top when none is named, by name: each
-- with how many folders and pages it holds itself. Searched, the ones
-- whose name carries the text typed, whatever its case, or each word of it
-- within an edit or two of a word of the name: a folder has its name alone
-- to be found by, and a level holds few enough to read every one.
SELECT id, parent_id, name, created_at, updated_at,
  (
    (SELECT count(*) FROM folders AS held WHERE held.parent_id = folders.id)
    + (SELECT count(*) FROM content WHERE content.folder_id = folders.id)
  )::int AS count
FROM folders
WHERE parent_id IS NOT DISTINCT FROM :parent_id::bigint
  AND (:q::text IS NULL
    OR name ILIKE '%' || like_escape(:q::text) || '%'
    OR words_near(name, :q::text))
ORDER BY name, id;
