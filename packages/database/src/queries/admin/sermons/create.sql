INSERT INTO sermons (slug, title, speaker, summary, body, image, video, date, status)
VALUES (:slug, :title, :speaker, :summary, :body, :image, :video, :date::date, :status)
RETURNING id, slug, created_at;
