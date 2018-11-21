-- dropdb noteful-app
-- createdb noteful-app
-- psql -U dev -d noteful-app -f /Users/trisha/projects/trisha-noteful-app-v2/db/noteful-app.sql 
-- psql -U dev -d noteful-app

DROP TABLE IF EXISTS notes
DROP TABLE IF EXISTS folders;

CREATE TABLE folders (
  id serial PRIMARY KEY, 
  name text NOT NULL
);

ALTER SEQUENCE folders_id_seq RESTART WITH 100; 
-- you can put alter sequence after create tables, works too

INSERT INTO folders (name) VALUES
  ('Archive'),
  ('Drafts'),
  ('Personal'),
  ('Work');

CREATE TABLE notes (
  id serial PRIMARY KEY,
  title text NOT NULL,
  content text,
  created timestamp DEFAULT now(),
  folder_id int REFERENCES folders(id) ON DELETE SET NULL
);

ALTER SEQUENCE notes_id_seq RESTART WITH 1000;

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
  );

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