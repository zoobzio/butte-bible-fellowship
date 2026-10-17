-- Replaces every field.
UPDATE staff
SET slug = :slug,
    name = :name,
    role = :role,
    bio = :bio,
    photo = :photo,
    email = :email,
    position = :position::int2,
    updated_at = now()
WHERE id = :id
RETURNING id, slug, updated_at;
