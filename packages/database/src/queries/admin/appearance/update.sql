UPDATE appearance
SET seeds = :seeds::jsonb,
    patch = :patch::jsonb,
    input = :input::jsonb,
    updated_at = now()
RETURNING updated_at;
