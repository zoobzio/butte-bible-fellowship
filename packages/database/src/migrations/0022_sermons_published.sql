-- A sermon comes from the church's YouTube channel, where its recording
-- is public already: it is on the site from the moment it is added, and
-- no longer a draft until told otherwise. The sermons added as drafts
-- before this are published with it. One archived stays as it is: that
-- was someone's choice.
ALTER TABLE sermons ALTER COLUMN status SET DEFAULT 'published';

UPDATE sermons SET status = 'published', updated_at = now() WHERE status = 'draft';
