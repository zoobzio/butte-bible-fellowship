INSERT INTO events (slug, title, summary, date, recurring, weeks, start_time, end_time)
VALUES (:slug, :title, :summary, :date::date, :recurring, :weeks::int2[], :start::time, :end::time)
RETURNING id, slug, created_at;
