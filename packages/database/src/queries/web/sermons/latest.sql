-- The newest sermons, as many as asked: three close the home page, and the
-- sermons page takes the rest.
SELECT id, title, published_at, thumbnail
FROM sermons
ORDER BY published_at DESC
LIMIT :limit::int;
