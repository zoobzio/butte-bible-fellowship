INSERT INTO staff (slug, name, role, summary, bio, photo, email, phone, position, status)
VALUES (:slug, :name, :role, :summary, :bio, :photo, :email, :phone, :position::int2, :status)
RETURNING id, slug, created_at;
