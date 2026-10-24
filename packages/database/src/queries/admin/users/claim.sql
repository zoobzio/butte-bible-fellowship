-- A first sign-in: binds Google's subject to the user added by that email,
-- when none is bound yet, and takes their name and photo. The caller passes
-- only an email Google has verified.
UPDATE users
SET sub = :sub,
    name = :name::text,
    picture = :picture::text,
    signed_in_at = now(),
    updated_at = now()
WHERE email = lower(:email::text) AND sub IS NULL
RETURNING id, email, name, picture, role;
