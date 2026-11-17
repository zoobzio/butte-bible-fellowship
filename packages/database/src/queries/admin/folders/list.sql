-- The folders inside one, or at the top when none is named: each with how
-- many folders and pages it holds itself, and what all that is under it
-- comes to, its size and when the last of it was changed, which its row
-- keeps: nothing under a folder is read to list it. Searched, the ones
-- whose name carries the text typed, whatever its case, or each word of
-- it within an edit or two of a word of the name: a folder has its name
-- alone to be found by.
-- Sorted by the column `sort` names in `direction`, and then by name,
-- which is all there is to it with `sort` null.
SELECT id, parent_id, name, size, created_at, updated_at, count
FROM folders
WHERE parent_id IS NOT DISTINCT FROM :parent_id::bigint
  AND (:q::text IS NULL
    OR name ILIKE '%' || like_escape(:q::text) || '%'
    OR words_near(name, :q::text))
ORDER BY
  CASE WHEN :sort::text IS NULL THEN name END,
  CASE WHEN :sort::text = 'name' AND :direction::text = 'desc' THEN name END DESC,
  CASE WHEN :sort::text = 'size' AND :direction::text = 'asc' THEN size END ASC,
  CASE WHEN :sort::text = 'size' AND :direction::text = 'desc' THEN size END DESC,
  CASE WHEN :sort::text = 'created_at' AND :direction::text = 'asc' THEN created_at END ASC,
  CASE WHEN :sort::text = 'created_at' AND :direction::text = 'desc' THEN created_at END DESC,
  CASE WHEN :sort::text = 'updated_at' AND :direction::text = 'asc' THEN updated_at END ASC,
  CASE WHEN :sort::text = 'updated_at' AND :direction::text = 'desc' THEN updated_at END DESC,
  name, id;
