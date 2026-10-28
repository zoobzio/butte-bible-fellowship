INSERT INTO staff (name, role, summary, bio, photo, email, phone, status)
VALUES (:name, :role, :summary, :bio::jsonb, :photo, :email, :phone, :status)
RETURNING id, created_at;
