INSERT INTO folders (name, parent_id)
VALUES (:name, :parent_id)
RETURNING id, created_at;
