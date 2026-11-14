-- Files a page in a folder, or at the top when none is named. What the
-- page says is as it was, so it is not marked as changed.
UPDATE content
SET folder_id = :folder_id::bigint
WHERE id = :id
RETURNING id, folder_id;
