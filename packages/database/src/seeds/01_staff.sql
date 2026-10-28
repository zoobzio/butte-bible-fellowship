INSERT INTO staff (name, role, summary, status)
SELECT name, role::staff_role, summary, status::content_status
FROM (VALUES
  ('Elder Name', 'elder', 'A few words about this elder — how long they have served, and what they care for at Butte Bible Fellowship.', 'published'),
  ('Elder Name', 'elder', 'A few words about this elder — how long they have served, and what they care for at Butte Bible Fellowship.', 'published'),
  ('Elder Name', 'elder', 'A few words about this elder — how long they have served, and what they care for at Butte Bible Fellowship.', 'published')
) AS seed (name, role, summary, status)
WHERE NOT EXISTS (SELECT 1 FROM staff);
