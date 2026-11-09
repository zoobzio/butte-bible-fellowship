INSERT INTO staff (name, role, summary, email, phone)
VALUES (:name, :role, :summary, :email, :phone)
RETURNING id, created_at;
