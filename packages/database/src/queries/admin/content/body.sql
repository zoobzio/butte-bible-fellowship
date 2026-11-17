-- What is written on an article, and its size with it: the bytes of the
-- body as text, none when there is no body.
UPDATE content
SET body = :body::jsonb,
    size = coalesce(octet_length(:body::jsonb::text), 0),
    updated_at = now()
WHERE id = :id
RETURNING id, size, updated_at;
