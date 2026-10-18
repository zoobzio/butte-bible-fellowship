-- Replaces every field.
UPDATE staff
SET slug = :slug,
    name = :name,
    role = :role,
    summary = :summary,
    bio = :bio,
    photo = :photo,
    email = :email,
    phone = :phone,
    position = :position::int2,
    status = :status,
    updated_at = now()
WHERE id = :id
RETURNING id, slug, updated_at;
