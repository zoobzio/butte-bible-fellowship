-- The admin's text search of the staff: a trigram index, so the substring
-- match of ILIKE reads the index rather than every row, and edit distance,
-- for the misspelling a trigram misses.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;

-- Whether every word typed comes within a few edits of a word of a text,
-- as a letter dropped or two swapped does, which trigrams miss in a short
-- word: no edit under four letters, one at four, two beyond. Nothing typed
-- is near nothing.
CREATE FUNCTION words_near(words text, typed text) RETURNS boolean
LANGUAGE sql IMMUTABLE STRICT PARALLEL SAFE
AS $$
  SELECT count(*) > 0 AND bool_and(EXISTS (
    SELECT 1 FROM regexp_split_to_table(lower(words), '[^[:alnum:]]+') AS word
    WHERE levenshtein_less_equal(word, typed_word, 2)
      <= CASE WHEN length(typed_word) < 4 THEN 0 WHEN length(typed_word) = 4 THEN 1 ELSE 2 END
  ))
  FROM regexp_split_to_table(lower(typed), '[^[:alnum:]]+') AS typed_word
  WHERE typed_word <> ''
$$;

-- The text of rich text (hast): every run of text in the tree, in order,
-- a space between; null for no tree.
CREATE FUNCTION hast_text(tree jsonb) RETURNS text
LANGUAGE sql IMMUTABLE STRICT PARALLEL SAFE
AS $$
  SELECT string_agg(node, ' ' ORDER BY ordinal)
  FROM jsonb_array_elements_text(
    jsonb_path_query_array(tree, 'strict $.** ? (@.type == "text").value')
  ) WITH ORDINALITY AS runs (node, ordinal)
$$;

-- What the free text is looked for in: the name, the email, the phone, the
-- summary and the bio, as one text the database keeps in step with them.
ALTER TABLE staff ADD COLUMN search text
  GENERATED ALWAYS AS (
    name
      || coalesce(' ' || email, '')
      || coalesce(' ' || phone, '')
      || coalesce(' ' || summary, '')
      || coalesce(' ' || hast_text(bio), '')
  ) STORED;

CREATE INDEX staff_search ON staff USING gin (search gin_trgm_ops);
