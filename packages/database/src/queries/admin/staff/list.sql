SELECT id, name, role, summary, bio, photo, email, phone, status, created_at, updated_at
FROM staff
WHERE (:q::text IS NULL OR name ILIKE '%' || :q::text || '%')
  AND (:role::staff_role IS NULL OR role = :role::staff_role)
  AND (:status::content_status IS NULL OR status = :status::content_status)
  AND (:updated_before::date IS NULL OR (updated_at AT TIME ZONE :tz::text)::date < :updated_before::date)
  AND (:updated_after::date IS NULL OR (updated_at AT TIME ZONE :tz::text)::date > :updated_after::date)
  AND (:updated_on::date IS NULL OR (updated_at AT TIME ZONE :tz::text)::date = :updated_on::date)
  AND (:created_before::date IS NULL OR (created_at AT TIME ZONE :tz::text)::date < :created_before::date)
  AND (:created_after::date IS NULL OR (created_at AT TIME ZONE :tz::text)::date > :created_after::date)
  AND (:created_on::date IS NULL OR (created_at AT TIME ZONE :tz::text)::date = :created_on::date)
ORDER BY role, name
LIMIT :size::int OFFSET :offset::int;
