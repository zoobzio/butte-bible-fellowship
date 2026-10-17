-- One sermon, by YouTube's id for it.
SELECT id, title, published_at, thumbnail
FROM sermons
WHERE id = :id;
