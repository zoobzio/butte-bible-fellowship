UPDATE staff
SET name = :name,
    role = :role,
    summary = :summary,
    email = :email,
    phone = :phone,
    updated_at = now()
WHERE id = :id
RETURNING id, updated_at;
