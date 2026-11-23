-- A list's count of the writes it has been through, as text: a mark to
-- hand back and be compared, and not a number to reckon with.
SELECT version::text AS version FROM changes WHERE surface = :surface;
