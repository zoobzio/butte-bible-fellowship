INSERT INTO events (slug, title, note, summary, body, image, location, date, day, weeks, start_time, end_time, status)
VALUES (:slug, :title, :note, :summary, :body, :image, :location, :date::date, :day, :weeks::int2[], :start::time, :end::time, :status)
RETURNING id, slug, created_at;
