UPDATE staff
SET photo = :photo,
    updated_at = now()
WHERE id = :id
RETURNING id, updated_at;
