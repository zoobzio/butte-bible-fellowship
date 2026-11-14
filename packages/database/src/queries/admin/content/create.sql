INSERT INTO content (slug, title, description, folder_id)
VALUES (:slug, :title, :description, :folder_id)
RETURNING id, slug, created_at;
