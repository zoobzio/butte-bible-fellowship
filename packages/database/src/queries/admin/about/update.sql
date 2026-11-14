UPDATE about
SET title = :title,
    description = :description,
    updated_at = now()
RETURNING updated_at;
