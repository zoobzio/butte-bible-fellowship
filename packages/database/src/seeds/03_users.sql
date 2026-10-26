-- The admin's first user, an `admin` so the app can be signed in to and
-- its users added from the start; bound to Google on first sign-in.
INSERT INTO users (email, role) VALUES
  ('alex@zoobz.io', 'admin')
ON CONFLICT (email) DO NOTHING;
