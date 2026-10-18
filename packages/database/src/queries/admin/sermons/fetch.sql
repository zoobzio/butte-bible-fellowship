SELECT id, slug, title, speaker, summary, body, image, video, date, status, created_at, updated_at
FROM sermons
WHERE id = :id;
