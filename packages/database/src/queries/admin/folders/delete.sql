-- Removes a folder that holds nothing: one with a folder or a page inside
-- it stays, and so does what it holds.
DELETE FROM folders
WHERE id = :id
  AND NOT EXISTS (SELECT 1 FROM folders AS held WHERE held.parent_id = :id)
  AND NOT EXISTS (SELECT 1 FROM content WHERE content.folder_id = :id);
