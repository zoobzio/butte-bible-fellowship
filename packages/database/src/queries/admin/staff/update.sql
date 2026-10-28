UPDATE staff
SET name = :name,
    role = :role,
    summary = :summary,
    bio = :bio::jsonb,
    photo = :photo,
    email = :email,
    phone = :phone,
    status = :status,
    updated_at = now()
WHERE id = :id
RETURNING id, updated_at;
