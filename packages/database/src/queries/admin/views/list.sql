-- A user's views of one list, in the order they were saved. The user is
-- named by `sub`, as their session names them.
SELECT views.id, views.surface, views.name, views.payload,
  views.created_at, views.updated_at
FROM views
JOIN users ON users.id = views.user_id
WHERE users.sub = :sub
  AND views.surface = :surface
ORDER BY views.created_at, views.id;
