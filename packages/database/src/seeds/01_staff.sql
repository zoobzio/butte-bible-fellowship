-- The connect page's staff: placeholders, published so the page has
-- someone to show, until the church names its elders.
INSERT INTO staff (slug, name, role, summary, position, status) VALUES
  ('elder-1', 'Elder Name', 'Elder', 'A few words about this elder — how long they have served, and what they care for at Butte Bible Fellowship.', 1, 'published'),
  ('elder-2', 'Elder Name', 'Elder', 'A few words about this elder — how long they have served, and what they care for at Butte Bible Fellowship.', 2, 'published'),
  ('elder-3', 'Elder Name', 'Elder', 'A few words about this elder — how long they have served, and what they care for at Butte Bible Fellowship.', 3, 'published')
ON CONFLICT (slug) DO NOTHING;
