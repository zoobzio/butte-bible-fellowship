-- The text, as typed, as the pattern the search text is matched against;
-- and the text near enough to a run of the words of the search text, by
-- trigram (pg_trgm) at its default threshold. Both read the trigram index.
WITH typed AS (
  SELECT CASE WHEN :q::text IS NULL THEN NULL
    ELSE '%' || like_escape(:q::text) || '%'
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
  -- A text column held, or not: the value, whatever its case, or whether
  -- the column is filled in, an empty one counted as missing; and the text
  -- it carries, or does not, or starts or ends with, as typed. A column
  -- left empty carries nothing, and so is not what it does not carry.
  AND (:name_is::text IS NULL OR CASE :name_is::text
    WHEN 'present' THEN nullif(name, '') IS NOT NULL
    WHEN 'missing' THEN nullif(name, '') IS NULL
    ELSE lower(name) = lower(:name_is::text) END)
  AND (:name_not::text IS NULL OR CASE :name_not::text
    WHEN 'present' THEN nullif(name, '') IS NULL
    WHEN 'missing' THEN nullif(name, '') IS NOT NULL
    ELSE name IS NULL OR lower(name) <> lower(:name_not::text) END)
  AND (:name_contains::text IS NULL OR name ILIKE '%' || like_escape(:name_contains::text) || '%')
  AND (:name_not_contains::text IS NULL OR name IS NULL OR name NOT ILIKE '%' || like_escape(:name_not_contains::text) || '%')
  AND (:name_starts_with::text IS NULL OR name ILIKE like_escape(:name_starts_with::text) || '%')
  AND (:name_ends_with::text IS NULL OR name ILIKE '%' || like_escape(:name_ends_with::text))
  AND (:email_is::text IS NULL OR CASE :email_is::text
    WHEN 'present' THEN nullif(email, '') IS NOT NULL
    WHEN 'missing' THEN nullif(email, '') IS NULL
    ELSE lower(email) = lower(:email_is::text) END)
  AND (:email_not::text IS NULL OR CASE :email_not::text
    WHEN 'present' THEN nullif(email, '') IS NULL
    WHEN 'missing' THEN nullif(email, '') IS NOT NULL
    ELSE email IS NULL OR lower(email) <> lower(:email_not::text) END)
  AND (:email_contains::text IS NULL OR email ILIKE '%' || like_escape(:email_contains::text) || '%')
  AND (:email_not_contains::text IS NULL OR email IS NULL OR email NOT ILIKE '%' || like_escape(:email_not_contains::text) || '%')
  AND (:email_starts_with::text IS NULL OR email ILIKE like_escape(:email_starts_with::text) || '%')
  AND (:email_ends_with::text IS NULL OR email ILIKE '%' || like_escape(:email_ends_with::text))
  AND (:phone_is::text IS NULL OR CASE :phone_is::text
    WHEN 'present' THEN nullif(phone, '') IS NOT NULL
    WHEN 'missing' THEN nullif(phone, '') IS NULL
    ELSE lower(phone) = lower(:phone_is::text) END)
  AND (:phone_not::text IS NULL OR CASE :phone_not::text
    WHEN 'present' THEN nullif(phone, '') IS NULL
    WHEN 'missing' THEN nullif(phone, '') IS NOT NULL
    ELSE phone IS NULL OR lower(phone) <> lower(:phone_not::text) END)
  AND (:phone_contains::text IS NULL OR phone ILIKE '%' || like_escape(:phone_contains::text) || '%')
  AND (:phone_not_contains::text IS NULL OR phone IS NULL OR phone NOT ILIKE '%' || like_escape(:phone_not_contains::text) || '%')
  AND (:phone_starts_with::text IS NULL OR phone ILIKE like_escape(:phone_starts_with::text) || '%')
  AND (:phone_ends_with::text IS NULL OR phone ILIKE '%' || like_escape(:phone_ends_with::text))
  AND (:summary_is::text IS NULL OR CASE :summary_is::text
    WHEN 'present' THEN nullif(summary, '') IS NOT NULL
    WHEN 'missing' THEN nullif(summary, '') IS NULL
    ELSE lower(summary) = lower(:summary_is::text) END)
  AND (:summary_not::text IS NULL OR CASE :summary_not::text
    WHEN 'present' THEN nullif(summary, '') IS NULL
    WHEN 'missing' THEN nullif(summary, '') IS NOT NULL
    ELSE summary IS NULL OR lower(summary) <> lower(:summary_not::text) END)
  AND (:summary_contains::text IS NULL OR summary ILIKE '%' || like_escape(:summary_contains::text) || '%')
  AND (:summary_not_contains::text IS NULL OR summary IS NULL OR summary NOT ILIKE '%' || like_escape(:summary_not_contains::text) || '%')
  AND (:summary_starts_with::text IS NULL OR summary ILIKE like_escape(:summary_starts_with::text) || '%')
  AND (:summary_ends_with::text IS NULL OR summary ILIKE '%' || like_escape(:summary_ends_with::text))
  AND (:photo_is::text IS NULL OR CASE :photo_is::text
    WHEN 'present' THEN nullif(photo, '') IS NOT NULL
    WHEN 'missing' THEN nullif(photo, '') IS NULL
    ELSE lower(photo) = lower(:photo_is::text) END)
  AND (:photo_not::text IS NULL OR CASE :photo_not::text
    WHEN 'present' THEN nullif(photo, '') IS NULL
    WHEN 'missing' THEN nullif(photo, '') IS NOT NULL
    ELSE photo IS NULL OR lower(photo) <> lower(:photo_not::text) END)
  AND (:photo_contains::text IS NULL OR photo ILIKE '%' || like_escape(:photo_contains::text) || '%')
  AND (:photo_not_contains::text IS NULL OR photo IS NULL OR photo NOT ILIKE '%' || like_escape(:photo_not_contains::text) || '%')
  AND (:photo_starts_with::text IS NULL OR photo ILIKE like_escape(:photo_starts_with::text) || '%')
  AND (:photo_ends_with::text IS NULL OR photo ILIKE '%' || like_escape(:photo_ends_with::text))
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
