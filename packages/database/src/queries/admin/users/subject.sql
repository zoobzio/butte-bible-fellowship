SELECT id, email, name, picture, role
FROM users
WHERE sub = :sub;
