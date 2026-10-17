-- The events page's calendar, as its front matter lists it: the week's
-- gatherings at 2255 Pillsbury Road.
INSERT INTO events (slug, title, note, day, weeks, start_time, end_time) VALUES
  ('adult-sunday-school', 'Adult Sunday School', NULL, 'sunday', NULL, '08:45', '09:30'),
  ('fellowship-time', 'Fellowship Time', NULL, 'sunday', NULL, '09:30', '09:55'),
  ('worship-service', 'Worship Service', NULL, 'sunday', NULL, '10:00', '11:30'),
  ('mens-breakfast-bible-study', 'Men’s Breakfast & Bible Study', NULL, 'tuesday', NULL, '07:00', '08:00'),
  ('womens-bible-study', 'Women’s Bible Study', NULL, 'tuesday', NULL, '10:00', '11:00'),
  ('stamp-ministry', 'Stamp Ministry', NULL, 'tuesday', ARRAY[1, 3]::int2[], '13:00', '15:00'),
  ('prayer-meeting', 'Prayer Meeting', 'All welcome', 'thursday', NULL, '10:00', '11:00'),
  ('volunteer-work-fellowship', 'Volunteer Work & Fellowship', NULL, 'thursday', NULL, '11:00', '12:00')
ON CONFLICT (slug) DO NOTHING;
