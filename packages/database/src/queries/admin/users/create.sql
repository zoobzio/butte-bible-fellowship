-- Adds a user by their email; they are bound to Google when they first sign in.
INSERT INTO users (email, role)
VALUES (lower(:email::text), :role)
RETURNING id, email, created_at;
