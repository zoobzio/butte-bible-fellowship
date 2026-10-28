UPDATE users
SET email = lower(:email::text),
    role = :role,
    sub = CASE WHEN email = lower(:email::text) THEN sub END,
    updated_at = now()
WHERE id = :id
RETURNING id, email, updated_at;
