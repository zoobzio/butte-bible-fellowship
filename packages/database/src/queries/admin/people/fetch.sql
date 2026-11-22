SELECT id, first_name, last_name, name, role, title, summary, bio, photo, email, phone,
  address, birthday, created_at, updated_at
FROM people
WHERE id = :id;
