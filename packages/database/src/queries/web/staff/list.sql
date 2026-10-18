-- The connect page's staff: the published, in the order they are listed.
SELECT slug, name, role, summary, bio, photo, email, phone
FROM staff
WHERE status = 'published'
ORDER BY position, name;
