SELECT id, slug, title, description, body, created_at, updated_at
FROM content
WHERE id = :id;
