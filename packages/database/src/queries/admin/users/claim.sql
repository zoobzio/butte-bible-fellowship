-- Pass only an email that Google verified.
UPDATE users
SET sub = :sub,
    name = :name::text,
    picture = :picture::text,
    signed_in_at = now(),
    updated_at = now()
WHERE email = lower(:email::text) AND sub IS NULL
RETURNING id, email, name, picture, role;
