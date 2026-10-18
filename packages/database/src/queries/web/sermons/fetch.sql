-- A sermon's own page, `/sermons/<slug>`: only a published one is there, and
-- it alone carries what is written about the sermon.
SELECT slug, title, speaker, summary, body, image, video, date
FROM sermons
WHERE slug = :slug AND status = 'published';
