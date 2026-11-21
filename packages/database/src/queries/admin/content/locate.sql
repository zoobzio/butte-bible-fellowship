-- The document filed in one folder, or at the top when none is named,
-- under a slug: the last step of a path that ends in a document.
SELECT id
FROM content
WHERE folder_id IS NOT DISTINCT FROM :folder_id::bigint
  AND slug = :slug;
