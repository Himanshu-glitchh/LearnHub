-- ========================
-- SEED: DEMO USERS
-- ========================
-- Password for all: "password123" (BCrypt hash)
INSERT INTO users (full_name, email, password_hash, enabled) VALUES
('Alice Johnson', 'alice@learnhub.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', true),
('Bob Smith',     'bob@learnhub.com',   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', true),
('Carol Davis',   'carol@learnhub.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', true)
ON CONFLICT (email) DO NOTHING;

INSERT INTO user_roles (user_id, role)
SELECT id, 'ROLE_INSTRUCTOR' FROM users WHERE email = 'alice@learnhub.com'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role)
SELECT id, 'ROLE_TUTOR' FROM users WHERE email = 'bob@learnhub.com'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role)
SELECT id, 'ROLE_STUDENT' FROM users WHERE email = 'carol@learnhub.com'
ON CONFLICT DO NOTHING;

-- ========================
-- SEED: COURSES
-- ========================
INSERT INTO courses (instructor_id, title, description, category, level, price, status, average_rating, total_enrollments, total_reviews)
SELECT u.id,
       c.title, c.body, c.category, c.lvl, c.price, 'PUBLISHED', c.rating, c.enrollments, c.reviews
FROM users u
CROSS JOIN (VALUES
  ('Complete React Developer Bootcamp',
   'Master React from scratch — hooks, context, Redux, React Query, testing, and deployment. Build 5 real-world projects.',
   'Web Dev', 'BEGINNER', 999, 4.8, 1240, 312),

  ('Spring Boot Microservices — Production Ready',
   'Build production-grade microservices with Spring Boot, Docker, Kubernetes, Kafka, and CI/CD pipelines.',
   'Web Dev', 'ADVANCED', 1499, 4.7, 870, 198),

  ('Python for Data Science & Machine Learning',
   'Go from Python basics to advanced ML models. Covers NumPy, Pandas, Matplotlib, Scikit-learn, TensorFlow.',
   'Data Science', 'INTERMEDIATE', 1299, 4.6, 2100, 487),

  ('DSA Masterclass — Crack Any Interview',
   'Complete Data Structures & Algorithms course covering arrays, trees, graphs, DP, and 200+ problems with solutions.',
   'Web Dev', 'INTERMEDIATE', 799, 4.9, 3400, 721),

  ('UI/UX Design with Figma — Zero to Hero',
   'Learn UX research, wireframing, prototyping and design systems in Figma. Build a portfolio-ready case study.',
   'Design', 'BEGINNER', 0, 4.5, 560, 134),

  ('AWS Cloud Practitioner + Solutions Architect',
   'Prepare for AWS certifications. Covers EC2, S3, Lambda, RDS, VPC, IAM, and real hands-on labs.',
   'DevOps', 'INTERMEDIATE', 1199, 4.7, 980, 223),

  ('Flutter & Dart — Build iOS & Android Apps',
   'Build beautiful cross-platform mobile apps with Flutter. Covers state management, Firebase, REST APIs.',
   'Mobile', 'BEGINNER', 899, 4.6, 670, 145),

  ('Advanced SQL & PostgreSQL for Developers',
   'Deep dive into SQL — window functions, CTEs, query optimization, indexing strategies and database design.',
   'Data Science', 'INTERMEDIATE', 599, 4.8, 430, 98),

  ('Full Stack JavaScript — MERN Stack',
   'Build full-stack apps with MongoDB, Express, React and Node.js. Includes authentication, deployment, and testing.',
   'Web Dev', 'INTERMEDIATE', 1099, 4.7, 1560, 341),

  ('DevOps with Docker & Kubernetes',
   'Containerize apps with Docker, orchestrate with Kubernetes, set up CI/CD with GitHub Actions. Hands-on labs.',
   'DevOps', 'ADVANCED', 1399, 4.8, 720, 167)
) AS c(title, body, category, lvl, price, rating, enrollments, reviews)
WHERE u.email = 'alice@learnhub.com';

-- ========================
-- SEED: SECTIONS & LESSONS
-- ========================
-- React course sections
WITH react_course AS (SELECT id FROM courses WHERE title = 'Complete React Developer Bootcamp' LIMIT 1)
INSERT INTO sections (course_id, title, order_index)
SELECT rc.id, s.title, s.ord FROM react_course rc
CROSS JOIN (VALUES
  ('Getting Started with React', 1),
  ('Core Concepts — Components & Props', 2),
  ('State Management & Hooks', 3),
  ('React Router & Navigation', 4),
  ('Working with APIs', 5),
  ('Final Project', 6)
) AS s(title, ord);

WITH react_course AS (SELECT id FROM courses WHERE title = 'Complete React Developer Bootcamp' LIMIT 1),
     sec1 AS (SELECT id FROM sections WHERE course_id = (SELECT id FROM react_course) AND order_index = 1)
INSERT INTO lessons (section_id, title, content_type, content_url, duration_seconds, order_index, is_free_preview)
SELECT s.id, l.title, l.ctype, l.url, l.dur, l.ord, l.preview
FROM sec1 s
CROSS JOIN (VALUES
  ('What is React & Why Use It?', 'VIDEO', 'https://www.youtube.com/watch?v=Tn6-PIqc4UM', 420, 1, true),
  ('Setting Up Your Dev Environment', 'VIDEO', 'https://www.youtube.com/watch?v=Tn6-PIqc4UM', 360, 2, true),
  ('Your First React App', 'VIDEO', 'https://www.youtube.com/watch?v=Tn6-PIqc4UM', 540, 3, false),
  ('Course Resources & Code', 'PDF', 'https://reactjs.org', 0, 4, false)
) AS l(title, ctype, url, dur, ord, preview);

-- DSA course sections
WITH dsa_course AS (SELECT id FROM courses WHERE title = 'DSA Masterclass — Crack Any Interview' LIMIT 1)
INSERT INTO sections (course_id, title, order_index)
SELECT dc.id, s.title, s.ord FROM dsa_course dc
CROSS JOIN (VALUES
  ('Arrays & Hashing', 1),
  ('Two Pointers & Sliding Window', 2),
  ('Linked Lists', 3),
  ('Trees & Binary Search', 4),
  ('Dynamic Programming', 5),
  ('Graphs & BFS/DFS', 6)
) AS s(title, ord);

-- Python course sections
WITH py_course AS (SELECT id FROM courses WHERE title = 'Python for Data Science & Machine Learning' LIMIT 1)
INSERT INTO sections (course_id, title, order_index)
SELECT pc.id, s.title, s.ord FROM py_course pc
CROSS JOIN (VALUES
  ('Python Basics Refresher', 1),
  ('NumPy & Pandas', 2),
  ('Data Visualization', 3),
  ('Machine Learning with Scikit-learn', 4),
  ('Deep Learning with TensorFlow', 5)
) AS s(title, ord);

-- ========================
-- SEED: QUIZZES
-- ========================
WITH react_course AS (SELECT id FROM courses WHERE title = 'Complete React Developer Bootcamp' LIMIT 1)
INSERT INTO quizzes (course_id, title, topic, description, duration_minutes, passing_score)
SELECT rc.id, q.title, q.topic, q.info, q.dur, q.pass FROM react_course rc
CROSS JOIN (VALUES
  ('React Fundamentals Quiz', 'React Basics', 'Test your React fundamentals knowledge', 15, 70),
  ('Hooks & State Quiz', 'React Hooks', 'Deep dive quiz on useState, useEffect and custom hooks', 20, 65)
) AS q(title, topic, info, dur, pass);

INSERT INTO quizzes (course_id, title, topic, description, duration_minutes, passing_score) VALUES
(NULL, 'JavaScript ES6+ Quiz', 'JavaScript', 'Test modern JS features: arrow functions, destructuring, promises, async/await', 20, 70),
(NULL, 'SQL Basics Quiz', 'SQL', 'Test your SQL knowledge — SELECT, JOINs, GROUP BY, subqueries', 15, 60),
(NULL, 'Data Structures Quiz', 'DSA', 'Arrays, Linked Lists, Stacks, Queues, Trees — fundamentals quiz', 25, 65),
(NULL, 'Python Basics Quiz', 'Python', 'Variables, loops, functions, OOP — Python fundamentals', 15, 60);

-- ========================
-- SEED: QUESTIONS (JS Quiz)
-- ========================
WITH js_quiz AS (SELECT id FROM quizzes WHERE title = 'JavaScript ES6+ Quiz' LIMIT 1)
INSERT INTO questions (quiz_id, question_text, type, options_json, correct_answer, difficulty, explanation, marks)
SELECT q.id, qu.text, qu.type, qu.opts::jsonb, qu.ans, qu.diff::varchar, qu.exp, 1
FROM js_quiz q
CROSS JOIN (VALUES
  ('What does the spread operator (...) do in JavaScript?',
   'MCQ', '["Copies array/object properties into another","Multiplies numbers","Creates a new function","Deletes array elements"]',
   'Copies array/object properties into another', 'EASY', 'The spread operator expands an iterable into individual elements.'),

  ('Which of the following correctly destructures an object?',
   'MCQ', '["const {name, age} = person","const [name, age] = person","const name, age = person","object.destructure(name, age)"]',
   'const {name, age} = person', 'EASY', 'Object destructuring uses curly braces to extract properties.'),

  ('What does async/await do?',
   'MCQ', '["Makes asynchronous code look synchronous","Makes synchronous code asynchronous","Creates a new thread","Replaces callbacks with arrays"]',
   'Makes asynchronous code look synchronous', 'MEDIUM', 'async/await is syntactic sugar over Promises.'),

  ('Arrow functions have their own ''this'' binding.',
   'TRUE_FALSE', '["True","False"]',
   'False', 'EASY', 'Arrow functions do NOT have their own this — they inherit it from the enclosing scope.'),

  ('What is the output of: console.log(typeof null)?',
   'MCQ', '["object","null","undefined","string"]',
   'object', 'MEDIUM', 'typeof null returning "object" is a known JavaScript bug that was never fixed for backwards compatibility.')
) AS qu(text, type, opts, ans, diff, exp);

-- SQL Quiz questions
WITH sql_quiz AS (SELECT id FROM quizzes WHERE title = 'SQL Basics Quiz' LIMIT 1)
INSERT INTO questions (quiz_id, question_text, type, options_json, correct_answer, difficulty, explanation, marks)
SELECT q.id, qu.text, qu.type, qu.opts::jsonb, qu.ans, qu.diff::varchar, qu.exp, 1
FROM sql_quiz q
CROSS JOIN (VALUES
  ('Which SQL clause filters rows after grouping?',
   'MCQ', '["HAVING","WHERE","GROUP BY","ORDER BY"]',
   'HAVING', 'MEDIUM', 'WHERE filters before grouping; HAVING filters after.'),

  ('What does a LEFT JOIN return?',
   'MCQ', '["All rows from left table + matched rows from right","Only matched rows","All rows from right table","Only unmatched rows"]',
   'All rows from left table + matched rows from right', 'EASY', 'LEFT JOIN returns all left table rows and NULLs for unmatched right rows.'),

  ('PRIMARY KEY can have NULL values.',
   'TRUE_FALSE', '["True","False"]',
   'False', 'EASY', 'PRIMARY KEY columns must be NOT NULL and unique.'),

  ('Which function counts non-NULL values?',
   'MCQ', '["COUNT(column)","COUNT(*)","SUM(column)","AVG(column)"]',
   'COUNT(column)', 'MEDIUM', 'COUNT(*) counts all rows; COUNT(column) only counts non-NULL values in that column.')
) AS qu(text, type, opts, ans, diff, exp);
