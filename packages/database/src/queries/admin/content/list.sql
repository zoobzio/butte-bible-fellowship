-- The pages filed in one folder, or at the top when none is named, sorted
-- by the column `sort` names in `direction`, a null last either way, and
-- then in the admin's own order, by title, which is all there is to it
-- with `sort` null.
SELECT id, folder_id, slug, title, description, body, created_at, updated_at
FROM content
WHERE folder_id IS NOT DISTINCT FROM :folder_id::bigint
ORDER BY
  CASE WHEN (:sort::text IS NULL OR :sort::text = 'title') AND :direction::text = 'asc' THEN title END ASC NULLS LAST,
  CASE WHEN :sort::text = 'title' AND :direction::text = 'desc' THEN title END DESC NULLS LAST,
  CASE WHEN :sort::text = 'slug' AND :direction::text = 'asc' THEN slug END ASC NULLS LAST,
  CASE WHEN :sort::text = 'slug' AND :direction::text = 'desc' THEN slug END DESC NULLS LAST,
  CASE WHEN :sort::text = 'created_at' AND :direction::text = 'asc' THEN created_at END ASC NULLS LAST,
  CASE WHEN :sort::text = 'created_at' AND :direction::text = 'desc' THEN created_at END DESC NULLS LAST,
  CASE WHEN :sort::text = 'updated_at' AND :direction::text = 'asc' THEN updated_at END ASC NULLS LAST,
  CASE WHEN :sort::text = 'updated_at' AND :direction::text = 'desc' THEN updated_at END DESC NULLS LAST,
  title, id;
