INSERT INTO staff (name, role, summary, email, phone, status)
VALUES (:name, :role, :summary, :email, :phone, :status)
RETURNING id, created_at;
