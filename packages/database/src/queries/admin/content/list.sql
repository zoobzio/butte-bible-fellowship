-- The pages filed in one folder, or at the top when none is named, which
-- the search leaves. The text, as typed, as the pattern the search text is
-- matched against; and the text near enough to a run of the words of the
-- search text, by trigram (pg_trgm) at its default threshold. Both read the
-- trigram index, and look no further than the folder.
WITH typed AS (
  SELECT CASE WHEN :q::text IS NULL THEN NULL
    ELSE '%' || like_escape(:q::text) || '%'
  END AS pattern
),
hits AS (
  SELECT id FROM content, typed
  WHERE folder_id IS NOT DISTINCT FROM :folder_id::bigint
    AND (search ILIKE typed.pattern OR :q::text <<% search)
),
-- Where those find nothing, each word typed within an edit or two of a word
-- of the search text (fuzzystrmatch), so a misspelling a trigram misses
-- still finds its page. Reads every page of the folder, so only when there
-- is no hit.
near AS (
  SELECT id FROM content
  WHERE folder_id IS NOT DISTINCT FROM :folder_id::bigint
    AND NOT EXISTS (SELECT 1 FROM hits) AND words_near(search, :q::text)
)
-- Sorted by the column `sort` names in `direction`, a null last either
-- way, and then in the admin's own order, by title, which is all there is
-- to it with `sort` null and nothing searched for.
SELECT id, folder_id, mime, slug, title, description, body, size, created_at, updated_at
FROM content, typed
WHERE folder_id IS NOT DISTINCT FROM :folder_id::bigint
  AND (typed.pattern IS NULL
    OR id IN (SELECT id FROM hits UNION ALL SELECT id FROM near))
  -- A text column held, or not: the value, whatever its case, or whether
  -- the column is filled in, an empty one counted as missing; and the text
  -- it carries, or does not, or starts or ends with, as typed.
  AND (:title_is::text IS NULL OR CASE :title_is::text
    WHEN 'present' THEN nullif(title, '') IS NOT NULL
    WHEN 'missing' THEN nullif(title, '') IS NULL
    ELSE lower(title) = lower(:title_is::text) END)
  AND (:title_not::text IS NULL OR CASE :title_not::text
    WHEN 'present' THEN nullif(title, '') IS NULL
    WHEN 'missing' THEN nullif(title, '') IS NOT NULL
    ELSE title IS NULL OR lower(title) <> lower(:title_not::text) END)
  AND (:title_contains::text IS NULL OR title ILIKE '%' || like_escape(:title_contains::text) || '%')
  AND (:title_not_contains::text IS NULL OR title IS NULL OR title NOT ILIKE '%' || like_escape(:title_not_contains::text) || '%')
  AND (:title_starts_with::text IS NULL OR title ILIKE like_escape(:title_starts_with::text) || '%')
  AND (:title_ends_with::text IS NULL OR title ILIKE '%' || like_escape(:title_ends_with::text))
  AND (:slug_is::text IS NULL OR CASE :slug_is::text
    WHEN 'present' THEN nullif(slug, '') IS NOT NULL
    WHEN 'missing' THEN nullif(slug, '') IS NULL
    ELSE lower(slug) = lower(:slug_is::text) END)
  AND (:slug_not::text IS NULL OR CASE :slug_not::text
    WHEN 'present' THEN nullif(slug, '') IS NULL
    WHEN 'missing' THEN nullif(slug, '') IS NOT NULL
    ELSE slug IS NULL OR lower(slug) <> lower(:slug_not::text) END)
  AND (:slug_contains::text IS NULL OR slug ILIKE '%' || like_escape(:slug_contains::text) || '%')
  AND (:slug_not_contains::text IS NULL OR slug IS NULL OR slug NOT ILIKE '%' || like_escape(:slug_not_contains::text) || '%')
  AND (:slug_starts_with::text IS NULL OR slug ILIKE like_escape(:slug_starts_with::text) || '%')
  AND (:slug_ends_with::text IS NULL OR slug ILIKE '%' || like_escape(:slug_ends_with::text))
  -- The media type, as any text column: `image/` started with is every image.
  AND (:mime_is::text IS NULL OR CASE :mime_is::text
    WHEN 'present' THEN nullif(mime, '') IS NOT NULL
    WHEN 'missing' THEN nullif(mime, '') IS NULL
    ELSE lower(mime) = lower(:mime_is::text) END)
  AND (:mime_not::text IS NULL OR CASE :mime_not::text
    WHEN 'present' THEN nullif(mime, '') IS NULL
    WHEN 'missing' THEN nullif(mime, '') IS NOT NULL
    ELSE mime IS NULL OR lower(mime) <> lower(:mime_not::text) END)
  AND (:mime_contains::text IS NULL OR mime ILIKE '%' || like_escape(:mime_contains::text) || '%')
  AND (:mime_not_contains::text IS NULL OR mime IS NULL OR mime NOT ILIKE '%' || like_escape(:mime_not_contains::text) || '%')
  AND (:mime_starts_with::text IS NULL OR mime ILIKE like_escape(:mime_starts_with::text) || '%')
  AND (:mime_ends_with::text IS NULL OR mime ILIKE '%' || like_escape(:mime_ends_with::text))
  AND (:updated_before::date IS NULL OR (updated_at AT TIME ZONE :tz::text)::date < :updated_before::date)
  AND (:updated_after::date IS NULL OR (updated_at AT TIME ZONE :tz::text)::date > :updated_after::date)
  AND (:updated_on::date IS NULL OR (updated_at AT TIME ZONE :tz::text)::date = :updated_on::date)
  AND (:updated_on_or_after::date IS NULL OR (updated_at AT TIME ZONE :tz::text)::date >= :updated_on_or_after::date)
  AND (:updated_on_or_before::date IS NULL OR (updated_at AT TIME ZONE :tz::text)::date <= :updated_on_or_before::date)
ORDER BY
  -- Without a sort, a search lists the nearest first: a page the text is in
  -- before one it is only near, and the nearer before the farther.
  CASE WHEN :sort::text IS NULL AND typed.pattern IS NOT NULL THEN (search ILIKE typed.pattern)::int END DESC,
  CASE WHEN :sort::text IS NULL AND typed.pattern IS NOT NULL THEN strict_word_similarity(:q::text, search) END DESC,
  CASE WHEN (:sort::text IS NULL OR :sort::text = 'title') AND :direction::text = 'asc' THEN title END ASC NULLS LAST,
  CASE WHEN :sort::text = 'title' AND :direction::text = 'desc' THEN title END DESC NULLS LAST,
  CASE WHEN :sort::text = 'slug' AND :direction::text = 'asc' THEN slug END ASC NULLS LAST,
  CASE WHEN :sort::text = 'slug' AND :direction::text = 'desc' THEN slug END DESC NULLS LAST,
  CASE WHEN :sort::text = 'mime' AND :direction::text = 'asc' THEN mime END ASC NULLS LAST,
  CASE WHEN :sort::text = 'mime' AND :direction::text = 'desc' THEN mime END DESC NULLS LAST,
  CASE WHEN :sort::text = 'size' AND :direction::text = 'asc' THEN size END ASC NULLS LAST,
  CASE WHEN :sort::text = 'size' AND :direction::text = 'desc' THEN size END DESC NULLS LAST,
  CASE WHEN :sort::text = 'created_at' AND :direction::text = 'asc' THEN created_at END ASC NULLS LAST,
  CASE WHEN :sort::text = 'created_at' AND :direction::text = 'desc' THEN created_at END DESC NULLS LAST,
  CASE WHEN :sort::text = 'updated_at' AND :direction::text = 'asc' THEN updated_at END ASC NULLS LAST,
  CASE WHEN :sort::text = 'updated_at' AND :direction::text = 'desc' THEN updated_at END DESC NULLS LAST,
  title, id;
