-- What the search's near match costs the planner: the two functions behind
-- the strict word similarity operators (<<% and its commutator %>>) carry
-- the default cost of a plain comparison, where on a member's search text
-- each costs some hundred times that. Costed as plain, the planner reads
-- every row rather than the trigram index, which it is told here is the
-- cheaper read. These are the extension's own functions, so a restore from
-- a dump that recreates the extension loses the hint until this runs again.
ALTER FUNCTION strict_word_similarity_op(text, text) COST 1000;
ALTER FUNCTION strict_word_similarity_commutator_op(text, text) COST 1000;
