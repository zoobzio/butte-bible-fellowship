-- The user Google's subject is bound to: who is signed in, on every request.
SELECT id, email, name, picture, role
FROM users
WHERE sub = :sub;
