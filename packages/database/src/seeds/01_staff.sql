-- The contact page's staff, as its front matter lists them: placeholders
-- until the church names its elders.
INSERT INTO staff (slug, name, role, bio, position) VALUES
  ('elder-1', 'Elder Name', 'Elder', 'A few words about this elder — how long they have served, and what they care for at Butte Bible Fellowship.', 1),
  ('elder-2', 'Elder Name', 'Elder', 'A few words about this elder — how long they have served, and what they care for at Butte Bible Fellowship.', 2),
  ('elder-3', 'Elder Name', 'Elder', 'A few words about this elder — how long they have served, and what they care for at Butte Bible Fellowship.', 3)
ON CONFLICT (slug) DO NOTHING;
