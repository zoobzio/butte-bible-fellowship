SELECT id, folder_id, mime, slug, title, description, body, size, created_at, updated_at
FROM content
WHERE id = :id;
