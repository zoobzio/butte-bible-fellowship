SELECT id, parent_id, name, created_at, updated_at,
  (
    (SELECT count(*) FROM folders AS held WHERE held.parent_id = folders.id)
    + (SELECT count(*) FROM content WHERE content.folder_id = folders.id)
  )::int AS count
FROM folders
WHERE id = :id;
