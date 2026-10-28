SELECT slug, title, speaker, summary, image, video, date
FROM sermons
WHERE status = 'published'
ORDER BY date DESC, created_at DESC
LIMIT :limit::int;
