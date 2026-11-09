UPDATE events
SET slug = :slug,
    title = :title,
    summary = :summary,
    date = :date::date,
    recurring = :recurring,
    weeks = :weeks::int2[],
    start_time = :start::time,
    end_time = :end::time,
    updated_at = now()
WHERE id = :id
RETURNING id, slug, updated_at;
