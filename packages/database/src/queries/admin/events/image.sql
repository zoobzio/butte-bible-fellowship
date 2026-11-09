UPDATE events
SET image = :image,
    updated_at = now()
WHERE id = :id
RETURNING id, updated_at;
