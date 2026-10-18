SELECT id, slug, name, role, summary, bio, photo, email, phone, position, status, created_at, updated_at
FROM staff
WHERE id = :id;
