-- The staff are the people who serve the church: everyone but its members.
SELECT id, name, role, title, summary, bio, photo, email, phone
FROM people
WHERE role <> 'member'
ORDER BY role, last_name, first_name;
