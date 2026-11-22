UPDATE people
SET bio = :bio::jsonb,
    updated_at = now()
WHERE id = :id
RETURNING id, updated_at;
