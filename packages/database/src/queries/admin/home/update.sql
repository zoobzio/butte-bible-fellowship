UPDATE home
SET title = :title,
    description = :description,
    hero_heading = :hero_heading,
    hero_description = :hero_description,
    hero_action = :hero_action,
    hero_link = :hero_link,
    updated_at = now()
RETURNING updated_at;
