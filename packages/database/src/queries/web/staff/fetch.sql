-- One member's own page, `/staff/<slug>`: only a published one is there.
SELECT slug, name, role, summary, bio, photo, email, phone
FROM staff
WHERE slug = :slug AND status = 'published';
