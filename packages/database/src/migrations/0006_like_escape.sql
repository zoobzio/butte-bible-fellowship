-- The text, as typed, as a pattern of LIKE matches it: a backslash, a
-- percent sign or an underscore is the character itself, not a wildcard.
-- Nothing typed is no pattern.
CREATE FUNCTION like_escape(typed text) RETURNS text
LANGUAGE sql IMMUTABLE STRICT PARALLEL SAFE
AS $$
  SELECT replace(replace(replace(typed, '\', '\\'), '%', '\%'), '_', '\_')
$$;
