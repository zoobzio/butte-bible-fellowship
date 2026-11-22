INSERT INTO people (first_name, last_name, role, summary)
SELECT first_name, last_name, role::person_role, summary
FROM (VALUES
  ('Elder', 'Name', 'elder', 'A few words about this elder — how long they have served, and what they care for at Butte Bible Fellowship.'),
  ('Elder', 'Name', 'elder', 'A few words about this elder — how long they have served, and what they care for at Butte Bible Fellowship.'),
  ('Elder', 'Name', 'elder', 'A few words about this elder — how long they have served, and what they care for at Butte Bible Fellowship.')
) AS seed (first_name, last_name, role, summary)
WHERE NOT EXISTS (SELECT 1 FROM people);
