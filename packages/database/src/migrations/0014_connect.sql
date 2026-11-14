-- The connect page, the third page of the site with a layout of its own:
-- a table of one row, as the home page and About Us have, which holds
-- whatever its layout shows. Its title and description are the header it
-- opens with; under them, how to find and reach the church, each a column
-- of its own: the street address, which the page's map is drawn from too,
-- the phone number, the fax number, the email address, and the hours its
-- office keeps, one line of text to a line of the page. All but the
-- address may be left out, and the page then says nothing of it. What is
-- written on the page, rich text as the others' is, is none until the
-- admin writes it. The row is made here, with the words the site had as
-- its interface's and its configuration's, and is never added or removed
-- after.
CREATE TABLE connect (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  title text NOT NULL,
  description text,
  address text NOT NULL,
  phone text,
  fax text,
  email text,
  hours text,
  body jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO connect (
  title,
  description,
  address,
  phone,
  fax,
  email,
  hours
) VALUES (
  'Connect',
  'We’d love to meet you. Here are the people to ask for, and how to reach us.',
  '2255 Pillsbury Road, Chico, California 95926',
  '530-892-0521',
  '530-898-1851',
  'office@bbfchurchchico.org',
  E'Tuesday–Thursday: 9am–4pm\nFriday: 9am–noon\nSaturday, Sunday, Monday: closed'
);
