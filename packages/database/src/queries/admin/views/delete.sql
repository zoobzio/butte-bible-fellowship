-- Removes a user's own view of one list, and no one else's.
DELETE FROM views
USING users
WHERE users.id = views.user_id
  AND users.sub = :sub
  AND views.surface = :surface
  AND views.id = :id::uuid;
