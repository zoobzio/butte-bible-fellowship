-- The text, as typed, as the pattern the search text is matched against;
-- and the text near enough to a run of the words of the search text, by
-- trigram (pg_trgm) at its default threshold. Both read the trigram index.
WITH typed AS (
  SELECT CASE WHEN :q::text IS NULL THEN NULL
    ELSE '%' || like_escape(:q::text) || '%'
  END AS pattern
),
hits AS (
  SELECT id FROM people, typed
  WHERE search ILIKE typed.pattern OR :q::text <<% search
),
-- Where those find nothing, each word typed within an edit or two of a word
-- of the search text (fuzzystrmatch), so a misspelling a trigram misses
-- still finds its person. Reads every row, so only when there is no hit.
near AS (
  SELECT id FROM people
  WHERE NOT EXISTS (SELECT 1 FROM hits) AND words_near(search, :q::text)
)
SELECT id, first_name, last_name, name, role, title, summary, bio, photo, email, phone,
  address, birthday, created_at, updated_at,
  count(*) OVER ()::int AS total
FROM people, typed
WHERE (typed.pattern IS NULL
    OR id IN (SELECT id FROM hits UNION ALL SELECT id FROM near))
  AND (:role_is::person_role IS NULL OR role = :role_is::person_role)
  AND (:role_not::person_role IS NULL OR role <> :role_not::person_role)
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
  AND (:address_is::text IS NULL OR CASE :address_is::text
    WHEN 'present' THEN nullif(address, '') IS NOT NULL
    WHEN 'missing' THEN nullif(address, '') IS NULL
    ELSE lower(address) = lower(:address_is::text) END)
  AND (:address_not::text IS NULL OR CASE :address_not::text
    WHEN 'present' THEN nullif(address, '') IS NULL
    WHEN 'missing' THEN nullif(address, '') IS NOT NULL
    ELSE address IS NULL OR lower(address) <> lower(:address_not::text) END)
  AND (:address_contains::text IS NULL OR address ILIKE '%' || like_escape(:address_contains::text) || '%')
  AND (:address_not_contains::text IS NULL OR address IS NULL OR address NOT ILIKE '%' || like_escape(:address_not_contains::text) || '%')
  AND (:address_starts_with::text IS NULL OR address ILIKE like_escape(:address_starts_with::text) || '%')
  AND (:address_ends_with::text IS NULL OR address ILIKE '%' || like_escape(:address_ends_with::text))
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
  -- By name is by the last name, then the first, as a directory reads.
  CASE WHEN :sort::text = 'name' AND :direction::text = 'asc' THEN last_name END ASC NULLS LAST,
  CASE WHEN :sort::text = 'name' AND :direction::text = 'asc' THEN first_name END ASC NULLS LAST,
  CASE WHEN :sort::text = 'name' AND :direction::text = 'desc' THEN last_name END DESC NULLS LAST,
  CASE WHEN :sort::text = 'name' AND :direction::text = 'desc' THEN first_name END DESC NULLS LAST,
  CASE WHEN :sort::text = 'role' AND :direction::text = 'asc' THEN role END ASC NULLS LAST,
  CASE WHEN :sort::text = 'role' AND :direction::text = 'desc' THEN role END DESC NULLS LAST,
  CASE WHEN :sort::text = 'email' AND :direction::text = 'asc' THEN email END ASC NULLS LAST,
  CASE WHEN :sort::text = 'email' AND :direction::text = 'desc' THEN email END DESC NULLS LAST,
  CASE WHEN :sort::text = 'phone' AND :direction::text = 'asc' THEN phone END ASC NULLS LAST,
  CASE WHEN :sort::text = 'phone' AND :direction::text = 'desc' THEN phone END DESC NULLS LAST,
  CASE WHEN :sort::text = 'title' AND :direction::text = 'asc' THEN title END ASC NULLS LAST,
  CASE WHEN :sort::text = 'title' AND :direction::text = 'desc' THEN title END DESC NULLS LAST,
  CASE WHEN :sort::text = 'birthday' AND :direction::text = 'asc' THEN birthday END ASC NULLS LAST,
  CASE WHEN :sort::text = 'birthday' AND :direction::text = 'desc' THEN birthday END DESC NULLS LAST,
  CASE WHEN :sort::text = 'created_at' AND :direction::text = 'asc' THEN created_at END ASC NULLS LAST,
  CASE WHEN :sort::text = 'created_at' AND :direction::text = 'desc' THEN created_at END DESC NULLS LAST,
  CASE WHEN :sort::text = 'updated_at' AND :direction::text = 'asc' THEN updated_at END ASC NULLS LAST,
  CASE WHEN :sort::text = 'updated_at' AND :direction::text = 'desc' THEN updated_at END DESC NULLS LAST,
  role, last_name, first_name
LIMIT :size::int OFFSET :offset::int;
