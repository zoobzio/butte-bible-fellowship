INSERT INTO people (first_name, last_name, role, title, summary, email, phone, address, birthday)
VALUES (:first_name, :last_name, :role, :title, :summary, :email, :phone, :address, :birthday::date)
RETURNING id, created_at;
