SELECT id, email, sub, name, picture, role, signed_in_at, created_at, updated_at
FROM users
WHERE id = :id;
