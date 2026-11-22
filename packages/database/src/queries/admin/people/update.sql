UPDATE people
SET first_name = :first_name,
    last_name = :last_name,
    role = :role,
    title = :title,
    summary = :summary,
    email = :email,
    phone = :phone,
    address = :address,
    birthday = :birthday::date,
    updated_at = now()
WHERE id = :id
RETURNING id, updated_at;
