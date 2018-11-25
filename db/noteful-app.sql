-- dropdb noteful-app
-- createdb noteful-app
-- psql -U dev -d noteful-app -f /Users/trisha/projects/trisha-noteful-app-v2/db/noteful-app.sql 
-- psql -U dev -d noteful-app

-- the order of DROP TABLE matters here, otherwise you'll get foreign key constraints errors
DROP TABLE IF EXISTS notes_tags;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS notes;
DROP TABLE IF EXISTS folders;

CREATE TABLE folders (
  id serial PRIMARY KEY, 
  name text NOT NULL UNIQUE
);

ALTER SEQUENCE folders_id_seq RESTART WITH 100; 

CREATE TABLE notes (
  id serial PRIMARY KEY,
  title text NOT NULL,
  content text,
  created timestamp DEFAULT now()
  -- folder_id int REFERENCES folders(id) ON DELETE SET NULL
);

ALTER SEQUENCE notes_id_seq RESTART WITH 1000;

-- After the folders and notes table is created, alter notes table to include a column folder_id
-- You'll get an ERROR:  duplicate key value violates unique constraint "folders_pkey" if you try to set the folder_id references when you create a table DETAIL:  Key (id)=(100) already exists.

ALTER TABLE notes ADD COLUMN folder_id int REFERENCES folders(id) ON DELETE SET NULL;

CREATE TABLE tags (
  id serial PRIMARY KEY, 
  name text NOT NULL UNIQUE
);

CREATE TABLE notes_tags (
  note_id INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE
);

INSERT INTO folders (name) VALUES
  ('Archive'),
  ('Drafts'),
  ('Personal'),
  ('Work');


INSERT INTO notes 
  (title, content, folder_id) 
VALUES 
  (
    '5 life lessons learned from cats',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    100
  ),
  (
    'What the government doesn''t want you to know about cats',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    101
  ),
  (
    'The most boring article about cats you''ll ever read',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    102
  ),
  (
    '7 things lady gaga has in common with cats',
    'Posuere sollicitudin aliquam ultrices sagittis orci a.'
  , 103
  ),
  (
    'The most incredible article about cats you''ll ever read',
    'Lorem ipsum dolor sit amet, boring consectetur adipiscing elit'
  , 100
  ),
  (
    '10 ways cats can help you live to 100',
    'Posuere sollicitudin aliquam ultrices sagittis orci a'
  , NULL
  ),
  (
    '9 reasons you can blame the recession on cats',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
  , 101
  ),
  (
    '10 ways marketers are making you addicted to cats',
    'Posuere sollicitudin aliquam ultrices sagittis orci a.'
  , 101
  ),
  (
    '11 ways investing in cats can make you a millionaire',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
    , NULL
  ),
  (
    'Why you should forget everything you learned about cats',
    'Posuere sollicitudin aliquam ultrices sagittis orci a.'
  , NULL
  );


INSERT INTO tags (name) VALUES
  ('smile'),
  ('happy'),
  ('amazing'), 
  ('cats');

INSERT INTO notes_tags (note_id, tag_id) VALUES
  (1001, 1),
  (1002, 1), (1002, 2),
  (1003, 1), (1003, 2), (1003, 3), 
  (1004, 1),
  (1005, 1), (1005, 2),
  (1006, 1),
  (1007, 1),
  (1008, 1), (1008, 4),
  (1009, 2);

-- -- get all from notes
--   SELECT * FROM notes;

-- -- get all from folders
--   SELECT * FROM folders;

-- -- get all notes with folders
-- SELECT * FROM notes
-- INNER JOIN folders ON notes.folder_id = folders.id;

-- -- get all notes, show folders if they exists otherwise null
-- SELECT * FROM notes
-- LEFT JOIN folders ON notes.folder_id = folders.id;

-- -- get all notes, show folders if they exists otherwise null
-- SELECT * FROM notes
-- LEFT JOIN folders ON notes.folder_id = folders.id
-- WHERE notes.id = 1001;

-- get all notes with left join
-- SELECT title, tags.name, folders.name FROM notes
-- LEFT JOIN folders ON notes.folder_id = folders.id
-- LEFT JOIN notes_tags ON notes.id = notes_tags.note_id
-- LEFT JOIN tags ON notes_tags.tag_id = tags.id;

--                           title                          |  name   |   name   
-- ---------------------------------------------------------+---------+----------
--  What the government doesn't want you to know about cats | smile   | Drafts
--  The most boring article about cats you'll ever read     | smile   | Personal
--  The most boring article about cats you'll ever read     | happy   | Personal
--  7 things lady gaga has in common with cats              | smile   | Work
--  7 things lady gaga has in common with cats              | happy   | Work
--  7 things lady gaga has in common with cats              | amazing | Work
--  The most incredible article about cats you'll ever read | smile   | Archive
--  10 ways cats can help you live to 100                   | smile   | 
--  10 ways cats can help you live to 100                   | happy   | 
--  9 reasons you can blame the recession on cats           | smile   | Drafts
--  10 ways marketers are making you addicted to cats       | smile   | Drafts
--  11 ways investing in cats can make you a millionaire    | smile   | 
--  11 ways investing in cats can make you a millionaire    | cats    | 
--  Why you should forget everything you learned about cats | happy   | 
--  5 life lessons learned from cats                        |         | Archive
-- (15 rows)


-- get all notes with inner join
-- SELECT title, tags.name, folders.name FROM notes
-- INNER JOIN folders ON notes.folder_id = folders.id
-- INNER JOIN notes_tags ON notes.id = notes_tags.note_id
-- INNER JOIN tags ON notes_tags.tag_id = tags.id;

--                           title                          |  name   |   name   
-- ---------------------------------------------------------+---------+----------
--  What the government doesn't want you to know about cats | smile   | Drafts
--  The most boring article about cats you'll ever read     | smile   | Personal
--  The most boring article about cats you'll ever read     | happy   | Personal
--  7 things lady gaga has in common with cats              | smile   | Work
--  7 things lady gaga has in common with cats              | happy   | Work
--  7 things lady gaga has in common with cats              | amazing | Work
--  The most incredible article about cats you'll ever read | smile   | Archive
--  9 reasons you can blame the recession on cats           | smile   | Drafts
--  10 ways marketers are making you addicted to cats       | smile   | Drafts
-- (9 rows)


-- get all notes with right join
-- SELECT title, tags.name, folders.name FROM notes
-- RIGHT JOIN folders ON notes.folder_id = folders.id
-- RIGHT JOIN notes_tags ON notes.id = notes_tags.note_id
-- RIGHT JOIN tags ON notes_tags.tag_id = tags.id;

--                           title                          |  name   |   name   
-- ---------------------------------------------------------+---------+----------
--  What the government doesn't want you to know about cats | smile   | Drafts
--  The most boring article about cats you'll ever read     | smile   | Personal
--  The most boring article about cats you'll ever read     | happy   | Personal
--  7 things lady gaga has in common with cats              | smile   | Work
--  7 things lady gaga has in common with cats              | happy   | Work
--  7 things lady gaga has in common with cats              | amazing | Work
--  The most incredible article about cats you'll ever read | smile   | Archive
--                                                          | smile   | 
--                                                          | happy   | 
--  9 reasons you can blame the recession on cats           | smile   | Drafts
--  10 ways marketers are making you addicted to cats       | smile   | Drafts
--                                                          | smile   | 
--                                                          | cats    | 
--                                                          | happy   | 
-- (14 rows)

