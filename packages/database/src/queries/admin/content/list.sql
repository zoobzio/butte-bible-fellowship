-- The text, as typed, as the pattern the search text is matched against;
-- and the text near enough to a run of the words of the search text, by
-- trigram (pg_trgm) at its default threshold. Both read the trigram index.
WITH typed AS (
  SELECT CASE WHEN :q::text IS NULL THEN NULL
    ELSE '%' || like_escape(:q::text) || '%'
  END AS pattern
),
hits AS (
  SELECT id FROM content, typed
  WHERE search ILIKE typed.pattern OR :q::text <<% search
),
-- Where those find nothing, each word typed within an edit or two of a word
-- of the search text (fuzzystrmatch), so a misspelling a trigram misses
-- still finds its page. Reads every row, so only when there is no hit.
near AS (
  SELECT id FROM content
  WHERE NOT EXISTS (SELECT 1 FROM hits) AND words_near(search, :q::text)
)
SELECT id, slug, title, description, body, created_at, updated_at,
  count(*) OVER ()::int AS total
FROM content, typed
WHERE (typed.pattern IS NULL
    OR id IN (SELECT id FROM hits UNION ALL SELECT id FROM near))
  -- A text column held, or not: the value, whatever its case, or whether
  -- the column is filled in, an empty one counted as missing; and the text
  -- it carries, or does not, or starts or ends with, as typed. A column
  -- left empty carries nothing, and so is not what it does not carry.
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
  AND (:description_is::text IS NULL OR CASE :description_is::text
    WHEN 'present' THEN nullif(description, '') IS NOT NULL
    WHEN 'missing' THEN nullif(description, '') IS NULL
    ELSE lower(description) = lower(:description_is::text) END)
  AND (:description_not::text IS NULL OR CASE :description_not::text
    WHEN 'present' THEN nullif(description, '') IS NULL
    WHEN 'missing' THEN nullif(description, '') IS NOT NULL
    ELSE description IS NULL OR lower(description) <> lower(:description_not::text) END)
  AND (:description_contains::text IS NULL OR description ILIKE '%' || like_escape(:description_contains::text) || '%')
  AND (:description_not_contains::text IS NULL OR description IS NULL OR description NOT ILIKE '%' || like_escape(:description_not_contains::text) || '%')
  AND (:description_starts_with::text IS NULL OR description ILIKE like_escape(:description_starts_with::text) || '%')
  AND (:description_ends_with::text IS NULL OR description ILIKE '%' || like_escape(:description_ends_with::text))
  -- The day a page was changed or added, read in the time zone given.
  AND (:updated_before::date IS NULL OR (updated_at AT TIME ZONE :tz::text)::date < :updated_before::date)
  AND (:updated_after::date IS NULL OR (updated_at AT TIME ZONE :tz::text)::date > :updated_after::date)
  AND (:updated_on::date IS NULL OR (updated_at AT TIME ZONE :tz::text)::date = :updated_on::date)
  AND (:updated_on_or_after::date IS NULL OR (updated_at AT TIME ZONE :tz::text)::date >= :updated_on_or_after::date)
  AND (:updated_on_or_before::date IS NULL OR (updated_at AT TIME ZONE :tz::text)::date <= :updated_on_or_before::date)
  AND (:created_before::date IS NULL OR (created_at AT TIME ZONE :tz::text)::date < :created_before::date)
  AND (:created_after::date IS NULL OR (created_at AT TIME ZONE :tz::text)::date > :created_after::date)
  AND (:created_on::date IS NULL OR (created_at AT TIME ZONE :tz::text)::date = :created_on::date)
  AND (:created_on_or_after::date IS NULL OR (created_at AT TIME ZONE :tz::text)::date >= :created_on_or_after::date)
  AND (:created_on_or_before::date IS NULL OR (created_at AT TIME ZONE :tz::text)::date <= :created_on_or_before::date)
ORDER BY
  -- Without a sort, a search lists the nearest first: a row the text is in
  -- before one it is only near, and the nearer before the farther.
  CASE WHEN :sort::text IS NULL AND typed.pattern IS NOT NULL THEN (search ILIKE typed.pattern)::int END DESC,
  CASE WHEN :sort::text IS NULL AND typed.pattern IS NOT NULL THEN strict_word_similarity(:q::text, search) END DESC,
  CASE WHEN :sort::text = 'title' AND :direction::text = 'asc' THEN title END ASC NULLS LAST,
  CASE WHEN :sort::text = 'title' AND :direction::text = 'desc' THEN title END DESC NULLS LAST,
  CASE WHEN :sort::text = 'slug' AND :direction::text = 'asc' THEN slug END ASC NULLS LAST,
  CASE WHEN :sort::text = 'slug' AND :direction::text = 'desc' THEN slug END DESC NULLS LAST,
  CASE WHEN :sort::text = 'created_at' AND :direction::text = 'asc' THEN created_at END ASC NULLS LAST,
  CASE WHEN :sort::text = 'created_at' AND :direction::text = 'desc' THEN created_at END DESC NULLS LAST,
  CASE WHEN :sort::text = 'updated_at' AND :direction::text = 'asc' THEN updated_at END ASC NULLS LAST,
  CASE WHEN :sort::text = 'updated_at' AND :direction::text = 'desc' THEN updated_at END DESC NULLS LAST,
  -- The admin's own order, after any sort: the pages by their slug.
  slug, id
LIMIT :size::int OFFSET :offset::int;
