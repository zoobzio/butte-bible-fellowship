UPDATE events
SET body = :body::jsonb,
    updated_at = now()
WHERE id = :id
RETURNING id, updated_at;
