SELECT slug, title, summary, image, date, recurring, weeks, start_time, end_time
FROM events
WHERE NOT recurring AND date >= :from::date
ORDER BY date, start_time;
