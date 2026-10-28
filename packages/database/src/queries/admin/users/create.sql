INSERT INTO users (email, role)
VALUES (lower(:email::text), :role)
RETURNING id, email, created_at;
