SELECT id, parent_id, name, size, created_at, updated_at, count
FROM folders
WHERE id = :id;
