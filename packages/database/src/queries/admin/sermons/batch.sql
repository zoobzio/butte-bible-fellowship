-- A batch of the sermons, the latest preached first, and of a day the
-- latest added: `size` of them, from the first, or from after the sermon
-- the batch before ended on, named by its day and its id together. A
-- sermon's body is left out, as a list of the site's leaves it. The batch
-- is of the sermons the search finds: every part of it left out, all of
-- them, in the same order either way, so a cursor holds under a search.
SELECT id, slug, title, speaker, summary, image, video, date, status, created_at, updated_at
FROM sermons
WHERE (:after_date::date IS NULL
    OR :after_id::bigint IS NULL
    OR (date, id) < (:after_date::date, :after_id::bigint))
  -- The free text, as typed, in the title, the speaker or the summary,
  -- whatever its case.
  AND (:q::text IS NULL
    OR concat_ws(' ', title, speaker, summary) ILIKE '%' || like_escape(:q::text) || '%')
  AND (:status_is::content_status IS NULL OR status = :status_is::content_status)
  AND (:status_not::content_status IS NULL OR status <> :status_not::content_status)
  -- A text column held, or not: the value, whatever its case, or whether
  -- the column is filled in, an empty one counted as missing; and the text
  -- it carries, or does not, or starts or ends with, as typed. A column
  -- left empty carries nothing, and so is not what it does not carry.
  AND (:title_is::text IS NULL OR CASE :title_is::text
    WHEN 'present' THEN nullif(title, '') IS NOT NULL
    WHEN 'missing' THEN nullif(title, '') IS NULL
    ELSE lower(title) = lower(:title_is::text) END)
  AND (:title_not::text IS NULL OR CASE :title_not::text
    WHEN 'present' THEN nullif(title, '') IS NULL
    WHEN 'missing' THEN nullif(title, '') IS NOT NULL
    ELSE title IS NULL OR lower(title) <> lower(:title_not::text) END)
  AND (:title_contains::text IS NULL OR title ILIKE '%' || like_escape(:title_contains::text) || '%')
  AND (:title_not_contains::text IS NULL OR title IS NULL OR title NOT ILIKE '%' || like_escape(:title_not_contains::text) || '%')
  AND (:title_starts_with::text IS NULL OR title ILIKE like_escape(:title_starts_with::text) || '%')
  AND (:title_ends_with::text IS NULL OR title ILIKE '%' || like_escape(:title_ends_with::text))
  AND (:speaker_is::text IS NULL OR CASE :speaker_is::text
    WHEN 'present' THEN nullif(speaker, '') IS NOT NULL
    WHEN 'missing' THEN nullif(speaker, '') IS NULL
    ELSE lower(speaker) = lower(:speaker_is::text) END)
  AND (:speaker_not::text IS NULL OR CASE :speaker_not::text
    WHEN 'present' THEN nullif(speaker, '') IS NULL
    WHEN 'missing' THEN nullif(speaker, '') IS NOT NULL
    ELSE speaker IS NULL OR lower(speaker) <> lower(:speaker_not::text) END)
  AND (:speaker_contains::text IS NULL OR speaker ILIKE '%' || like_escape(:speaker_contains::text) || '%')
  AND (:speaker_not_contains::text IS NULL OR speaker IS NULL OR speaker NOT ILIKE '%' || like_escape(:speaker_not_contains::text) || '%')
  AND (:speaker_starts_with::text IS NULL OR speaker ILIKE like_escape(:speaker_starts_with::text) || '%')
  AND (:speaker_ends_with::text IS NULL OR speaker ILIKE '%' || like_escape(:speaker_ends_with::text))
  AND (:summary_is::text IS NULL OR CASE :summary_is::text
    WHEN 'present' THEN nullif(summary, '') IS NOT NULL
    WHEN 'missing' THEN nullif(summary, '') IS NULL
    ELSE lower(summary) = lower(:summary_is::text) END)
  AND (:summary_not::text IS NULL OR CASE :summary_not::text
    WHEN 'present' THEN nullif(summary, '') IS NULL
    WHEN 'missing' THEN nullif(summary, '') IS NOT NULL
    ELSE summary IS NULL OR lower(summary) <> lower(:summary_not::text) END)
  AND (:summary_contains::text IS NULL OR summary ILIKE '%' || like_escape(:summary_contains::text) || '%')
  AND (:summary_not_contains::text IS NULL OR summary IS NULL OR summary NOT ILIKE '%' || like_escape(:summary_not_contains::text) || '%')
  AND (:summary_starts_with::text IS NULL OR summary ILIKE like_escape(:summary_starts_with::text) || '%')
  AND (:summary_ends_with::text IS NULL OR summary ILIKE '%' || like_escape(:summary_ends_with::text))
  -- The day a sermon was preached, as it is written.
  AND (:date_before::date IS NULL OR date < :date_before::date)
  AND (:date_after::date IS NULL OR date > :date_after::date)
  AND (:date_on::date IS NULL OR date = :date_on::date)
  AND (:date_on_or_after::date IS NULL OR date >= :date_on_or_after::date)
  AND (:date_on_or_before::date IS NULL OR date <= :date_on_or_before::date)
ORDER BY date DESC, id DESC
LIMIT :size::int;
