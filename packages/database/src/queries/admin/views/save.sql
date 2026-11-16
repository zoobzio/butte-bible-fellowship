-- Saves a view under the id its maker gave it: a new one is written, and
-- the user's own of the same list takes the new name and payload. No row
-- comes back when no user has the `sub`, or when the id is a view of
-- another user's or of another list, which is left as it is.
INSERT INTO views (id, user_id, surface, name, payload)
SELECT :id::uuid, users.id, :surface::text, :name::text, :payload::jsonb
FROM users
WHERE users.sub = :sub
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    payload = EXCLUDED.payload,
    updated_at = now()
WHERE views.user_id = EXCLUDED.user_id
  AND views.surface = EXCLUDED.surface
RETURNING id, surface, name, payload, created_at, updated_at;
