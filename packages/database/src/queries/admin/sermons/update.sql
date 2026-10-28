UPDATE sermons
SET slug = :slug,
    title = :title,
    speaker = :speaker,
    summary = :summary,
    body = :body,
    image = :image,
    video = :video,
    date = :date::date,
    status = :status,
    updated_at = now()
WHERE id = :id
RETURNING id, slug, updated_at;
