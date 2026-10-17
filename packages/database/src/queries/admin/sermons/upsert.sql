-- A sermon as the feed lists it: written if new, brought up to date if not.
INSERT INTO sermons (id, title, published_at, thumbnail)
VALUES (:id, :title, :published::timestamptz, :thumbnail)
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    published_at = EXCLUDED.published_at,
    thumbnail = EXCLUDED.thumbnail,
    updated_at = now()
RETURNING id, created_at, updated_at;
