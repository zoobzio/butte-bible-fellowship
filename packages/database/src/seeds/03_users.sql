INSERT INTO users (email, role) VALUES
  ('alex@zoobz.io', 'admin')
ON CONFLICT (email) DO NOTHING;
