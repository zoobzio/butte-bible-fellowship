SELECT id, name, role, summary, bio, photo, email, phone, created_at, updated_at
FROM staff
WHERE id = :id;
