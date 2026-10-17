SELECT id, slug, name, role, bio, photo, email, position, created_at, updated_at
FROM staff
WHERE id = :id;
