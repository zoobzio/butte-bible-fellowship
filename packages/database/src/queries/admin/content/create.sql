INSERT INTO content (slug, title, description)
VALUES (:slug, :title, :description)
RETURNING id, slug, created_at;
