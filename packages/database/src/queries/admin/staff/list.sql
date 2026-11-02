-- The text, as typed, as the pattern the search text is matched against;
-- and the text near enough to a run of the words of the search text, by
-- trigram (pg_trgm) at its default threshold. Both read the trigram index.
WITH typed AS (
  SELECT CASE WHEN :q::text IS NULL THEN NULL
    ELSE '%' || replace(replace(replace(:q::text, '\', '\\'), '%', '\%'), '_', '\_') || '%'
  END AS pattern
),
hits AS (
  SELECT id FROM staff, typed
  WHERE search ILIKE typed.pattern OR :q::text <<% search
),
-- Where those find nothing, each word typed within an edit or two of a word
-- of the search text (fuzzystrmatch), so a misspelling a trigram misses
-- still finds its member. Reads every row, so only when there is no hit.
near AS (
  SELECT id FROM staff
  WHERE NOT EXISTS (SELECT 1 FROM hits) AND words_near(search, :q::text)
)
SELECT id, name, role, summary, bio, photo, email, phone, status, created_at, updated_at,
  count(*) OVER ()::int AS total
FROM staff, typed
WHERE (typed.pattern IS NULL
    OR id IN (SELECT id FROM hits UNION ALL SELECT id FROM near))
  AND (:role_is::staff_role IS NULL OR role = :role_is::staff_role)
  AND (:role_not::staff_role IS NULL OR role <> :role_not::staff_role)
  AND (:status_is::content_status IS NULL OR status = :status_is::content_status)
  AND (:status_not::content_status IS NULL OR status <> :status_not::content_status)
  AND (:email::text IS NULL OR (nullif(email, '') IS NOT NULL) = (:email::text = 'present'))
  AND (:phone::text IS NULL OR (nullif(phone, '') IS NOT NULL) = (:phone::text = 'present'))
  AND (:summary::text IS NULL OR (nullif(summary, '') IS NOT NULL) = (:summary::text = 'present'))
  AND (:photo::text IS NULL OR (nullif(photo, '') IS NOT NULL) = (:photo::text = 'present'))
  AND (:updated_before::date IS NULL OR (updated_at AT TIME ZONE :tz::text)::date < :updated_before::date)
  AND (:updated_after::date IS NULL OR (updated_at AT TIME ZONE :tz::text)::date > :updated_after::date)
  AND (:updated_on::date IS NULL OR (updated_at AT TIME ZONE :tz::text)::date = :updated_on::date)
  AND (:created_before::date IS NULL OR (created_at AT TIME ZONE :tz::text)::date < :created_before::date)
  AND (:created_after::date IS NULL OR (created_at AT TIME ZONE :tz::text)::date > :created_after::date)
  AND (:created_on::date IS NULL OR (created_at AT TIME ZONE :tz::text)::date = :created_on::date)
ORDER BY
  -- Without a sort, a search lists the nearest first: a row the text is in
  -- before one it is only near, and the nearer before the farther.
  CASE WHEN :sort::text IS NULL AND typed.pattern IS NOT NULL THEN (search ILIKE typed.pattern)::int END DESC,
  CASE WHEN :sort::text IS NULL AND typed.pattern IS NOT NULL THEN strict_word_similarity(:q::text, search) END DESC,
  CASE WHEN :sort::text = 'name' AND :direction::text = 'asc' THEN name END ASC NULLS LAST,
  CASE WHEN :sort::text = 'name' AND :direction::text = 'desc' THEN name END DESC NULLS LAST,
  CASE WHEN :sort::text = 'role' AND :direction::text = 'asc' THEN role END ASC NULLS LAST,
  CASE WHEN :sort::text = 'role' AND :direction::text = 'desc' THEN role END DESC NULLS LAST,
  CASE WHEN :sort::text = 'status' AND :direction::text = 'asc' THEN status END ASC NULLS LAST,
  CASE WHEN :sort::text = 'status' AND :direction::text = 'desc' THEN status END DESC NULLS LAST,
  CASE WHEN :sort::text = 'email' AND :direction::text = 'asc' THEN email END ASC NULLS LAST,
  CASE WHEN :sort::text = 'email' AND :direction::text = 'desc' THEN email END DESC NULLS LAST,
  CASE WHEN :sort::text = 'phone' AND :direction::text = 'asc' THEN phone END ASC NULLS LAST,
  CASE WHEN :sort::text = 'phone' AND :direction::text = 'desc' THEN phone END DESC NULLS LAST,
  CASE WHEN :sort::text = 'created_at' AND :direction::text = 'asc' THEN created_at END ASC NULLS LAST,
  CASE WHEN :sort::text = 'created_at' AND :direction::text = 'desc' THEN created_at END DESC NULLS LAST,
  CASE WHEN :sort::text = 'updated_at' AND :direction::text = 'asc' THEN updated_at END ASC NULLS LAST,
  CASE WHEN :sort::text = 'updated_at' AND :direction::text = 'desc' THEN updated_at END DESC NULLS LAST,
  role, name
LIMIT :size::int OFFSET :offset::int;
