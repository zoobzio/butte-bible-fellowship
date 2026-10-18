-- Every member, whatever their status, in the order the site would list them.
SELECT id, slug, name, role, summary, bio, photo, email, phone, position, status, created_at, updated_at
FROM staff
ORDER BY position, name;
