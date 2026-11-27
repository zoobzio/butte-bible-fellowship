-- Adds the recordings the sermons do not hold yet, each published, as a
-- sermon is unless told otherwise, and so on the site at once, in one
-- statement: `entries` is a JSON array of them, each with its `video`,
-- YouTube's id for it, its `title`, its `speaker`, its `summary`, the `date` it was
-- preached, and the `slug` it goes by, with the `fallback` it goes by
-- instead where another sermon has taken the slug. A video the sermons
-- hold already is left as it is, whatever was changed of it since, and
-- only the sermons added come back.
INSERT INTO sermons (slug, title, speaker, summary, video, date)
SELECT
  CASE WHEN EXISTS (SELECT 1 FROM sermons taken WHERE taken.slug = entry.slug)
    THEN entry.fallback
    ELSE entry.slug
  END,
  entry.title,
  entry.speaker,
  entry.summary,
  entry.video,
  entry.date
FROM jsonb_to_recordset(:entries::jsonb)
  AS entry (slug text, fallback text, title text, speaker text, summary text, video text, date date)
ON CONFLICT (video) DO NOTHING
RETURNING id, slug, video;
