UPDATE content
SET slug = :slug,
    title = :title,
    description = :description,
    updated_at = now()
WHERE id = :id
RETURNING id, slug, updated_at;
