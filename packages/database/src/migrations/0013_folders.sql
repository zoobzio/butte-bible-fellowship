-- The blog's folders, which whoever writes it sorts its posts into however
-- they like: each named, and inside another or at the top, under none. A
-- folder's name is its own among the folders beside it, the top's counted
-- as beside one another.
CREATE TABLE folders (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  parent_id bigint REFERENCES folders (id),
  name text NOT NULL CHECK (name <> ''),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE NULLS NOT DISTINCT (parent_id, name)
);

-- The folder a page is filed in: none, and it is at the top. A folder that
-- holds a page, or another folder, is not removed from under it.
ALTER TABLE content ADD COLUMN folder_id bigint REFERENCES folders (id);

CREATE INDEX content_folder ON content (folder_id);
