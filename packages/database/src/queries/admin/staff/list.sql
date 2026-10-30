-- The text, as typed, as the pattern each text column is matched against.
WITH search AS (
  SELECT CASE WHEN :q::text IS NULL THEN NULL
    ELSE '%' || replace(replace(replace(:q::text, '\', '\\'), '%', '\%'), '_', '\_') || '%'
  END AS pattern
)
SELECT id, name, role, summary, bio, photo, email, phone, status, created_at, updated_at,
  count(*) OVER ()::int AS total
FROM staff, search
WHERE (search.pattern IS NULL
    OR name ILIKE search.pattern
    OR email ILIKE search.pattern
    OR phone ILIKE search.pattern
    OR summary ILIKE search.pattern)
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
