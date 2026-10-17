INSERT INTO staff (slug, name, role, bio, photo, email, position)
VALUES (:slug, :name, :role, :bio, :photo, :email, :position::int2)
RETURNING id, slug, created_at;
