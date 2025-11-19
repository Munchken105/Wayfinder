DROP DATABASE IF EXISTS wayfinder;
CREATE DATABASE wayfinder;
\c wayfinder;

DROP TABLE IF EXISTS librarians CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS librarian_subjects CASCADE;

CREATE TABLE IF NOT EXISTS librarians (
    id SERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
	last_name TEXT NOT NULL,
    room TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS subjects (
	id SERIAL PRIMARY KEY,
	subject_name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS librarian_subjects (
	librarian_id INT REFERENCES librarians(id) ON DELETE CASCADE,
	subject_id INT REFERENCES subjects(id) ON DELETE CASCADE,
	PRIMARY KEY (librarian_id, subject_id)
);

INSERT INTO librarians (first_name, last_name, room) VALUES ('Molly', 'Poremski', '423 Lockwood');				-- ID: 1
INSERT INTO librarians (first_name, last_name, room) VALUES ('Natalia', 'Estrada', '322 Lockwood');				-- ID: 2
INSERT INTO librarians (first_name, last_name, room) VALUES ('Michael', 'Kicey', '424 Lockwood');				-- ID: 3
INSERT INTO librarians (first_name, last_name, room) VALUES ('Bryan', 'Sajecki', '523 Lockwood');				-- ID: 4
INSERT INTO librarians (first_name, last_name, room) VALUES ('Anna', 'Mayersohn', '108A Lockwood');				-- ID: 5
INSERT INTO librarians (first_name, last_name, room) VALUES ('Carolyn', 'Klotzbach-Russell', '422 Lockwood');	-- ID: 6
INSERT INTO librarians (first_name, last_name, room) VALUES ('Laura', 'Taddeo', '421 Lockwood');				-- ID: 7
INSERT INTO librarians (first_name, last_name, room) VALUES ('Mary', 'Kamela', '520C Lockwood');				-- ID: 8
INSERT INTO librarians (first_name, last_name, room) VALUES ('Jill', 'Hackenberg', '117 Lockwood');				-- ID: 9
INSERT INTO librarians (first_name, last_name, room) VALUES ('Deborah', 'Chiarella', '517 Lockwood');			-- ID: 10
INSERT INTO librarians (first_name, last_name, room) VALUES ('Erin', 'Rowley', '119 Lockwood');					-- ID: 11
INSERT INTO librarians (first_name, last_name, room) VALUES ('Ally', 'Wood', '116 Lockwood');					-- ID: 12
INSERT INTO librarians (first_name, last_name, room) VALUES ('Sam', 'Kim', '118 Lockwood');						-- ID: 13
INSERT INTO librarians (first_name, last_name, room) VALUES ('Fred', 'Stoss', '105 Lockwood');					-- ID: 14

-- To insert future librarians add it right above this line to ensure id increments don't affect the existing ids.

INSERT INTO subjects (subject_name) VALUES ('African & American-American Studies'); 	-- ID: 1
INSERT INTO subjects (subject_name) VALUES ('American Studies'); 						-- ID: 2
INSERT INTO subjects (subject_name) VALUES ('Anthropology'); 							-- ID: 3
INSERT INTO subjects (subject_name) VALUES ('Art'); 									-- ID: 4
INSERT INTO subjects (subject_name) VALUES ('Arts Management'); 						-- ID: 5
INSERT INTO subjects (subject_name) VALUES ('Asian Studies');							-- ID: 6
INSERT INTO subjects (subject_name) VALUES ('Athletics');								-- ID: 7
INSERT INTO subjects (subject_name) VALUES ('Biological Sciences');						-- ID: 8
INSERT INTO subjects (subject_name) VALUES ('Business');								-- ID: 9
INSERT INTO subjects (subject_name) VALUES ('Canadian Studies');						-- ID: 10
INSERT INTO subjects (subject_name) VALUES ('Caribbean Cultural Studies');				-- ID: 11
INSERT INTO subjects (subject_name) VALUES ('Chemistry');								-- ID: 12
INSERT INTO subjects (subject_name) VALUES ('Children & Young Adult Literature');		-- ID: 13
INSERT INTO subjects (subject_name) VALUES ('Classics');								-- ID: 14
INSERT INTO subjects (subject_name) VALUES ('Communication');							-- ID: 15
INSERT INTO subjects (subject_name) VALUES ('Comparative Literature');					-- ID: 16
INSERT INTO subjects (subject_name) VALUES ('Computer Science');						-- ID: 17
INSERT INTO subjects (subject_name) VALUES ('Dance');									-- ID: 18
INSERT INTO subjects (subject_name) VALUES ('Early Christian Church');					-- ID: 19
INSERT INTO subjects (subject_name) VALUES ('Economics');								-- ID: 20
INSERT INTO subjects (subject_name) VALUES ('Education');								-- ID: 21
INSERT INTO subjects (subject_name) VALUES ('Engineering');								-- ID: 22
INSERT INTO subjects (subject_name) VALUES ('Engineering Education');					-- ID: 23
INSERT INTO subjects (subject_name) VALUES ('English & American Literature');			-- ID: 24
INSERT INTO subjects (subject_name) VALUES ('Environment and Sustainability');			-- ID: 25
INSERT INTO subjects (subject_name) VALUES ('Finance');									-- ID: 26
INSERT INTO subjects (subject_name) VALUES ('Geographic Information Systems (GIS)');	-- ID: 27
INSERT INTO subjects (subject_name) VALUES ('Geography, Human');						-- ID: 28
INSERT INTO subjects (subject_name) VALUES ('Geography, Physical');						-- ID: 29
INSERT INTO subjects (subject_name) VALUES ('Earth Science');							-- ID: 30
INSERT INTO subjects (subject_name) VALUES ('German Language & Literature');			-- ID: 31
INSERT INTO subjects (subject_name) VALUES ('Global Gender Studies');					-- ID: 32
INSERT INTO subjects (subject_name) VALUES ('Government Information');					-- ID: 33
INSERT INTO subjects (subject_name) VALUES ('History');									-- ID: 34
INSERT INTO subjects (subject_name) VALUES ('Honors College');							-- ID: 35
INSERT INTO subjects (subject_name) VALUES ('Jewish Studies');							-- ID: 36
INSERT INTO subjects (subject_name) VALUES ('Latino/a Studies');						-- ID: 37
INSERT INTO subjects (subject_name) VALUES ('Learning & Instruction');					-- ID: 38
INSERT INTO subjects (subject_name) VALUES ('Library & Information Science');			-- ID: 39
INSERT INTO subjects (subject_name) VALUES ('Linguistics');								-- ID: 40
INSERT INTO subjects (subject_name) VALUES ('Management');								-- ID: 41
INSERT INTO subjects (subject_name) VALUES ('Mathematics');								-- ID: 42
INSERT INTO subjects (subject_name) VALUES ('Media Study');								-- ID: 43
INSERT INTO subjects (subject_name) VALUES ('Music');									-- ID: 44
INSERT INTO subjects (subject_name) VALUES ('Philosophy');								-- ID: 45
INSERT INTO subjects (subject_name) VALUES ('Physics');									-- ID: 46
INSERT INTO subjects (subject_name) VALUES ('Political Science');						-- ID: 47
INSERT INTO subjects (subject_name) VALUES ('Psychology');								-- ID: 48
INSERT INTO subjects (subject_name) VALUES ('Religious Studies');						-- ID: 49
INSERT INTO subjects (subject_name) VALUES ('Romance Languages & Literatures');			-- ID: 50
INSERT INTO subjects (subject_name) VALUES ('Social Work');								-- ID: 51
INSERT INTO subjects (subject_name) VALUES ('Sociology');								-- ID: 52
INSERT INTO subjects (subject_name) VALUES ('Theatre');									-- ID: 53
INSERT INTO subjects (subject_name) VALUES ('Transnational Studies');					-- ID: 54
INSERT INTO subjects (subject_name) VALUES ('Visual Studies');							-- ID: 55

-- To insert future subjects add it right above this line to ensure id increments don't affect the existing ids.

INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (1, 1); -- Molly Poremski
INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (1, 2);
INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (1, 6);
INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (1, 10);
INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (1, 11);
INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (1, 21);
INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (1, 32);
INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (1, 37);
INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (1, 38);
INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (1, 39);
INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (1, 40);
INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (1, 50);
INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (1, 54); 

INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (2, 3); -- Natalia Estrada

INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (3, 4); -- Michael Kicey
INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (3, 5);
INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (3, 14);
INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (3, 16);
INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (3, 19);
INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (3, 31);
INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (3, 34);
INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (3, 36);
INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (3, 43);
INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (3, 45);
INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (3, 49);
INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (3, 55);

INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (4, 7); -- Bryan Sajecki
INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (4, 51);

INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (5, 8); -- Anna Mayersohn
INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (5, 12);
INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (5, 46);

INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (6, 9); -- Carolyn Klotzbach-Russell
INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (6, 20);
INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (6, 26);
INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (6, 33);
INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (6, 41);
INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (6, 47);
INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (6, 52);

INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (7, 13); -- Laura Taddeo
INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (7, 24);

INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (8, 15); -- Mary Kamela
INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (8, 35);

INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (9, 17); -- Jill Hackenberg
INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (9, 42);

INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (10, 18); -- Deborah Chiarella
INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (10, 44);
INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (10, 53);

INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (11, 22); -- Erin Rowley
INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (11, 23);

INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (12, 22); -- Ally Wood
INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (12, 23);

INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (13, 27); -- Sam Kim
INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (13, 28);
INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (13, 29);

INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (14, 25); -- Fred Stoss
INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (14, 30);
INSERT INTO librarian_subjects (librarian_id, subject_id) VALUES (14, 48);

-- Don't forget to connect a librarian to a subject when adding a new librarian 