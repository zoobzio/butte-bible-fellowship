SELECT id, title, published_at, thumbnail, created_at, updated_at
FROM sermons
WHERE id = :id;
