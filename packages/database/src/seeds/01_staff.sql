INSERT INTO staff (name, role, summary)
SELECT name, role::staff_role, summary
FROM (VALUES
  ('Elder Name', 'elder', 'A few words about this elder — how long they have served, and what they care for at Butte Bible Fellowship.'),
  ('Elder Name', 'elder', 'A few words about this elder — how long they have served, and what they care for at Butte Bible Fellowship.'),
  ('Elder Name', 'elder', 'A few words about this elder — how long they have served, and what they care for at Butte Bible Fellowship.')
) AS seed (name, role, summary)
WHERE NOT EXISTS (SELECT 1 FROM staff);
