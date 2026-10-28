SELECT slug, name, role, summary, bio, photo, email, phone
FROM staff
WHERE slug = :slug AND status = 'published';
