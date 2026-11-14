UPDATE folders
SET name = :name,
    updated_at = now()
WHERE id = :id
RETURNING id, updated_at;
