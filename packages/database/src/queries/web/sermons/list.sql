-- The newest sermons, as many as asked: three close the home page, and the
-- sermons page takes the rest. What is written about a sermon is its own
-- page's to carry.
SELECT slug, title, speaker, summary, image, video, date
FROM sermons
WHERE status = 'published'
ORDER BY date DESC, created_at DESC
LIMIT :limit::int;
