-- An event happens once, on its date, or repeats every week on its day: one
-- of the two, as the schema insists. Null weeks is every week.
INSERT INTO events (slug, title, note, location, date, day, weeks, start_time, end_time)
VALUES (:slug, :title, :note, :location, :date::date, :day, :weeks::int2[], :start::time, :end::time)
RETURNING id, slug, created_at;
