SELECT id, slug, title, speaker, summary, body, image, video, date, status, created_at, updated_at
FROM sermons
ORDER BY date DESC, created_at DESC;
