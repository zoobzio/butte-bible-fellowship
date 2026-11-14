UPDATE home
SET hero_image = :image,
    updated_at = now()
RETURNING updated_at;
