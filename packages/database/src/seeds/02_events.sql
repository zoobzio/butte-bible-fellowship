INSERT INTO events (slug, title, note, summary, body, day, weeks, start_time, end_time, status) VALUES
  (
    'adult-sunday-school',
    'Adult Sunday School',
    NULL,
    'Adults open the Scriptures together before the worship service.',
    'Before the worship service, adults meet to open the Scriptures together: to read, to ask questions, and to think through what we believe and why.

We believe theology matters — not for the purpose of intellectual achievement, but for the purpose of knowing the one we worship and follow. Newcomers are always welcome.',
    'sunday', NULL, '08:45', '09:30', 'published'
  ),
  (
    'fellowship-time',
    'Fellowship Time',
    NULL,
    'Time to catch up with one another between Sunday school and the worship service.',
    'Between Sunday school and the worship service, we pause to catch up with one another.

If you are visiting, it’s an easy place to meet people: arrive a little early and say hello.',
    'sunday', NULL, '09:30', '09:55', 'published'
  ),
  (
    'worship-service',
    'Worship Service',
    NULL,
    'We gather on Sunday morning to worship God together.',
    'Sunday morning is the center of our week: we gather to worship God together, to pray, and to hear the Scriptures taught.

Whoever you are and wherever you’re at, you’re welcome here. We’d be pleased if you joined us for a few Sundays to get a feel for who we are and who we are becoming.',
    'sunday', NULL, '10:00', '11:30', 'published'
  ),
  (
    'mens-breakfast-bible-study',
    'Men’s Breakfast & Bible Study',
    NULL,
    'The men of the church meet over breakfast and an open Bible.',
    'The men of the church start the day together over breakfast and an open Bible.

Any man is welcome to pull up a chair, whether you have studied the Scriptures for decades or are opening them for the first time.',
    'tuesday', NULL, '07:00', '08:00', 'published'
  ),
  (
    'womens-bible-study',
    'Women’s Bible Study',
    NULL,
    'The women of the church meet to study the Scriptures together.',
    'The women of the church meet to study the Scriptures together and to encourage one another.

Any woman is welcome to join, whether you have studied the Scriptures for decades or are opening them for the first time.',
    'tuesday', NULL, '10:00', '11:00', 'published'
  ),
  (
    'stamp-ministry',
    'Stamp Ministry',
    NULL,
    'One of the ways our congregation serves together.',
    'The stamp ministry is one of the ways our congregation serves together.

Extra hands are always welcome. Call or email the office to learn how you can help.',
    'tuesday', ARRAY[1, 3]::int2[], '13:00', '15:00', 'published'
  ),
  (
    'prayer-meeting',
    'Prayer Meeting',
    'All welcome',
    'We meet in the middle of the week to pray together.',
    'We set aside time in the middle of the week to pray together — for one another, for our church, and for our city.

All are welcome, whether to pray aloud or simply to sit with us.',
    'thursday', NULL, '10:00', '11:00', 'published'
  ),
  (
    'volunteer-work-fellowship',
    'Volunteer Work & Fellowship',
    NULL,
    'Volunteers lend a hand with the work of the church.',
    'After the prayer meeting, volunteers stay on to lend a hand with the work of the church, and to enjoy one another’s company while they do.

If you’d like to help, come along — or ask the office what is needed this week.',
    'thursday', NULL, '11:00', '12:00', 'published'
  )
ON CONFLICT (slug) DO NOTHING;
