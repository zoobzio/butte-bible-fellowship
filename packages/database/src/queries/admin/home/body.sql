UPDATE home
SET body = :body::jsonb,
    updated_at = now()
RETURNING updated_at;
