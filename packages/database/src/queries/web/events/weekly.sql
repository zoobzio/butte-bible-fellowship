SELECT slug, title, summary, image, date, recurring, weeks, start_time, end_time
FROM events
WHERE recurring
ORDER BY extract(dow FROM date), start_time;
