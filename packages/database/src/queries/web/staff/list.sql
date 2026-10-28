SELECT id, name, role, summary, bio, photo, email, phone
FROM staff
WHERE status = 'published'
ORDER BY role, name;
