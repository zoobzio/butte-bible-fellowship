UPDATE events
SET slug = :slug,
    title = :title,
    note = :note,
    summary = :summary,
    body = :body,
    image = :image,
    location = :location,
    date = :date::date,
    day = :day,
    weeks = :weeks::int2[],
    start_time = :start::time,
    end_time = :end::time,
    status = :status,
    updated_at = now()
WHERE id = :id
RETURNING id, slug, updated_at;
