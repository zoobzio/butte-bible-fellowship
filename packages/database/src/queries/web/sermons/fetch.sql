SELECT slug, title, speaker, summary, body, image, video, date
FROM sermons
WHERE slug = :slug AND status = 'published';
