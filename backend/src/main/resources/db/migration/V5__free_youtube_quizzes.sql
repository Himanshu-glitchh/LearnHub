-- ========================
-- 1. MAKE ALL COURSES FREE
-- ========================
UPDATE courses SET price = 0;

-- ========================
-- 2. SET ALL QUIZ TIMERS TO 5 MIN, 5 QUESTIONS MIN
-- ========================
UPDATE quizzes SET duration_minutes = 5;

-- ========================
-- 3. ADD YOUTUBE LESSONS TO REACT COURSE
-- ========================
WITH react_s1 AS (
    SELECT s.id FROM sections s
    JOIN courses c ON c.id = s.course_id
    WHERE c.title = 'Complete React Developer Bootcamp' AND s.order_index = 1
    LIMIT 1
)
INSERT INTO lessons (section_id, title, content_type, content_url, duration_seconds, order_index, is_free_preview)
SELECT s.id, l.title, 'VIDEO', l.url, l.dur, l.ord, l.preview
FROM react_s1 s
CROSS JOIN (VALUES
  ('What is React?', 'https://www.youtube.com/watch?v=Tn6-PIqc4UM', 419, 1, true),
  ('Setting Up Your Dev Environment', 'https://www.youtube.com/watch?v=w7ejDZ8SWv8', 360, 2, true),
  ('JSX Deep Dive', 'https://www.youtube.com/watch?v=7fPXI_MnBOY', 480, 3, false)
) AS l(title, url, dur, ord, preview);

WITH react_s2 AS (
    SELECT s.id FROM sections s
    JOIN courses c ON c.id = s.course_id
    WHERE c.title = 'Complete React Developer Bootcamp' AND s.order_index = 2
    LIMIT 1
)
INSERT INTO lessons (section_id, title, content_type, content_url, duration_seconds, order_index, is_free_preview)
SELECT s.id, l.title, 'VIDEO', l.url, l.dur, l.ord, false
FROM react_s2 s
CROSS JOIN (VALUES
  ('Components & Props Explained', 'https://www.youtube.com/watch?v=Y2hgEGPzTZY', 600, 1, false),
  ('Functional vs Class Components', 'https://www.youtube.com/watch?v=dpw9EHDh2bM', 540, 2, false),
  ('Props Drilling & Composition', 'https://www.youtube.com/watch?v=IYvD9oBCuJI', 480, 3, false)
) AS l(title, url, dur, ord, preview);

WITH react_s3 AS (
    SELECT s.id FROM sections s
    JOIN courses c ON c.id = s.course_id
    WHERE c.title = 'Complete React Developer Bootcamp' AND s.order_index = 3
    LIMIT 1
)
INSERT INTO lessons (section_id, title, content_type, content_url, duration_seconds, order_index, is_free_preview)
SELECT s.id, l.title, 'VIDEO', l.url, l.dur, l.ord, false
FROM react_s3 s
CROSS JOIN (VALUES
  ('useState Hook Complete Guide', 'https://www.youtube.com/watch?v=O6P86uwfdR0', 720, 1, false),
  ('useEffect — Side Effects in React', 'https://www.youtube.com/watch?v=0ZJgIjIuY7U', 660, 2, false),
  ('Custom Hooks — Build Your Own', 'https://www.youtube.com/watch?v=6ThXsUwLWvc', 600, 3, false),
  ('useContext for Global State', 'https://www.youtube.com/watch?v=5LrDIWkK_Bc', 540, 4, false)
) AS l(title, url, dur, ord, preview);

-- ========================
-- 4. ADD YOUTUBE LESSONS TO DSA COURSE
-- ========================
WITH dsa_s1 AS (
    SELECT s.id FROM sections s
    JOIN courses c ON c.id = s.course_id
    WHERE c.title = 'DSA Masterclass — Crack Any Interview' AND s.order_index = 1
    LIMIT 1
)
INSERT INTO lessons (section_id, title, content_type, content_url, duration_seconds, order_index, is_free_preview)
SELECT s.id, l.title, 'VIDEO', l.url, l.dur, l.ord, l.preview
FROM dsa_s1 s
CROSS JOIN (VALUES
  ('Arrays — Complete Guide', 'https://www.youtube.com/watch?v=pmN9ExDf3yQ', 900, 1, true),
  ('HashMap & HashSet Explained', 'https://www.youtube.com/watch?v=KyUTuwz_b7Q', 720, 2, true),
  ('Two Sum Problem Walkthrough', 'https://www.youtube.com/watch?v=KLlXCFG5TnA', 600, 3, false),
  ('Sliding Window Technique', 'https://www.youtube.com/watch?v=MK-NZ4hN7rs', 780, 4, false)
) AS l(title, url, dur, ord, preview);

WITH dsa_s4 AS (
    SELECT s.id FROM sections s
    JOIN courses c ON c.id = s.course_id
    WHERE c.title = 'DSA Masterclass — Crack Any Interview' AND s.order_index = 4
    LIMIT 1
)
INSERT INTO lessons (section_id, title, content_type, content_url, duration_seconds, order_index, is_free_preview)
SELECT s.id, l.title, 'VIDEO', l.url, l.dur, l.ord, false
FROM dsa_s4 s
CROSS JOIN (VALUES
  ('Binary Search — Full Tutorial', 'https://www.youtube.com/watch?v=s4DPM8ct1pI', 660, 1, false),
  ('Binary Tree Traversals (BFS/DFS)', 'https://www.youtube.com/watch?v=fAAZixBzIAI', 720, 2, false),
  ('BST — Insert, Search, Delete', 'https://www.youtube.com/watch?v=COZK7NATh4k', 780, 3, false)
) AS l(title, url, dur, ord, preview);

WITH dsa_s5 AS (
    SELECT s.id FROM sections s
    JOIN courses c ON c.id = s.course_id
    WHERE c.title = 'DSA Masterclass — Crack Any Interview' AND s.order_index = 5
    LIMIT 1
)
INSERT INTO lessons (section_id, title, content_type, content_url, duration_seconds, order_index, is_free_preview)
SELECT s.id, l.title, 'VIDEO', l.url, l.dur, l.ord, false
FROM dsa_s5 s
CROSS JOIN (VALUES
  ('Dynamic Programming — Introduction', 'https://www.youtube.com/watch?v=oBt53YbR9Kk', 900, 1, false),
  ('Fibonacci — Memoization vs Tabulation', 'https://www.youtube.com/watch?v=tyB0ztf0DNY', 600, 2, false),
  ('Coin Change Problem', 'https://www.youtube.com/watch?v=H9bfqozjoqs', 720, 3, false),
  ('Longest Common Subsequence', 'https://www.youtube.com/watch?v=ASoaQq66foQ', 660, 4, false)
) AS l(title, url, dur, ord, preview);

-- ========================
-- 5. ADD YOUTUBE LESSONS TO PYTHON COURSE
-- ========================
WITH py_s1 AS (
    SELECT s.id FROM sections s
    JOIN courses c ON c.id = s.course_id
    WHERE c.title = 'Python for Data Science & Machine Learning' AND s.order_index = 1
    LIMIT 1
)
INSERT INTO lessons (section_id, title, content_type, content_url, duration_seconds, order_index, is_free_preview)
SELECT s.id, l.title, 'VIDEO', l.url, l.dur, l.ord, l.preview
FROM py_s1 s
CROSS JOIN (VALUES
  ('Python Crash Course for Beginners', 'https://www.youtube.com/watch?v=rfscVS0vtbw', 900, 1, true),
  ('Python Functions & OOP', 'https://www.youtube.com/watch?v=Ej_02ICOIgs', 720, 2, false),
  ('List Comprehensions & Generators', 'https://www.youtube.com/watch?v=3dt4OGnU5sM', 480, 3, false)
) AS l(title, url, dur, ord, preview);

WITH py_s2 AS (
    SELECT s.id FROM sections s
    JOIN courses c ON c.id = s.course_id
    WHERE c.title = 'Python for Data Science & Machine Learning' AND s.order_index = 2
    LIMIT 1
)
INSERT INTO lessons (section_id, title, content_type, content_url, duration_seconds, order_index, is_free_preview)
SELECT s.id, l.title, 'VIDEO', l.url, l.dur, l.ord, false
FROM py_s2 s
CROSS JOIN (VALUES
  ('NumPy for Beginners', 'https://www.youtube.com/watch?v=QUT1VHiLmmI', 780, 1, false),
  ('Pandas Complete Tutorial', 'https://www.youtube.com/watch?v=vmEHCJofslg', 900, 2, false),
  ('Data Cleaning with Pandas', 'https://www.youtube.com/watch?v=bDhvCp3_lYw', 660, 3, false)
) AS l(title, url, dur, ord, preview);

-- ========================
-- 6. ADD 5 QUESTIONS TO EACH QUIZ (ensure 5 questions total)
-- ========================

-- React Fundamentals Quiz - add more questions
WITH rq AS (SELECT id FROM quizzes WHERE title = 'React Fundamentals Quiz' LIMIT 1)
INSERT INTO questions (quiz_id, question_text, type, options_json, correct_answer, difficulty, explanation, marks)
SELECT q.id, qu.text, qu.type, qu.opts::jsonb, qu.ans, qu.diff::varchar, qu.exp, 1
FROM rq q
CROSS JOIN (VALUES
  ('What is JSX in React?',
   'MCQ', '["JavaScript XML — a syntax extension for React","A CSS framework","A database query language","A testing library"]',
   'JavaScript XML — a syntax extension for React', 'EASY', 'JSX lets you write HTML-like code inside JavaScript.'),

  ('Which hook is used for side effects in React?',
   'MCQ', '["useEffect","useState","useRef","useMemo"]',
   'useEffect', 'EASY', 'useEffect runs after every render and is used for API calls, subscriptions, etc.'),

  ('React components must return a single root element.',
   'TRUE_FALSE', '["True","False"]',
   'True', 'EASY', 'React components must return a single root element, or use a Fragment (<> </>).'),

  ('What does the key prop do in React lists?',
   'MCQ', '["Helps React identify which items changed, added, or removed","Sets keyboard shortcuts","Encrypts data","Creates unique CSS classes"]',
   'Helps React identify which items changed, added, or removed', 'MEDIUM', 'Keys help React efficiently update the DOM.'),

  ('What is the Virtual DOM?',
   'MCQ', '["A lightweight JS representation of the real DOM","A browser API","A state management tool","A CSS preprocessor"]',
   'A lightweight JS representation of the real DOM', 'MEDIUM', 'React uses a virtual DOM to batch and optimize real DOM updates.')
) AS qu(text, type, opts, ans, diff, exp);

-- Hooks & State Quiz
WITH hq AS (SELECT id FROM quizzes WHERE title = 'Hooks & State Quiz' LIMIT 1)
INSERT INTO questions (quiz_id, question_text, type, options_json, correct_answer, difficulty, explanation, marks)
SELECT q.id, qu.text, qu.type, qu.opts::jsonb, qu.ans, qu.diff::varchar, qu.exp, 1
FROM hq q
CROSS JOIN (VALUES
  ('What does useState return?',
   'MCQ', '["An array with state value and setter function","An object with get and set methods","A Promise","A ref object"]',
   'An array with state value and setter function', 'EASY', 'useState returns [state, setState] — a value and a function to update it.'),

  ('When does useEffect run by default?',
   'MCQ', '["After every render","Only on mount","Only on unmount","Only when state changes"]',
   'After every render', 'EASY', 'With no dependency array, useEffect runs after every render.'),

  ('How do you run useEffect only once on mount?',
   'MCQ', '["Pass an empty array [] as second argument","Pass null","Do not pass any second argument","Pass false"]',
   'Pass an empty array [] as second argument', 'EASY', 'An empty dependency array makes useEffect run only on initial mount.'),

  ('useRef can be used to store mutable values without triggering re-render.',
   'TRUE_FALSE', '["True","False"]',
   'True', 'MEDIUM', 'useRef returns a mutable ref object that persists across renders without causing re-renders.'),

  ('What is the purpose of useMemo?',
   'MCQ', '["Memoize expensive calculations to avoid re-computation","Fetch data from an API","Manage global state","Handle form inputs"]',
   'Memoize expensive calculations to avoid re-computation', 'MEDIUM', 'useMemo returns a cached value and only recomputes when dependencies change.')
) AS qu(text, type, opts, ans, diff, exp);

-- Data Structures Quiz
WITH dsq AS (SELECT id FROM quizzes WHERE title = 'Data Structures Quiz' LIMIT 1)
INSERT INTO questions (quiz_id, question_text, type, options_json, correct_answer, difficulty, explanation, marks)
SELECT q.id, qu.text, qu.type, qu.opts::jsonb, qu.ans, qu.diff::varchar, qu.exp, 1
FROM dsq q
CROSS JOIN (VALUES
  ('What is the time complexity of accessing an element in an array by index?',
   'MCQ', '["O(1)","O(n)","O(log n)","O(n²)"]',
   'O(1)', 'EASY', 'Array access by index is O(1) — direct memory address calculation.'),

  ('Which data structure follows LIFO (Last In First Out)?',
   'MCQ', '["Stack","Queue","Linked List","Tree"]',
   'Stack', 'EASY', 'A Stack follows LIFO — the last element inserted is the first to be removed.'),

  ('A Binary Search Tree must have all left children less than the root.',
   'TRUE_FALSE', '["True","False"]',
   'True', 'EASY', 'In a BST, left subtree has values smaller and right subtree has values greater than the root.'),

  ('What is the worst-case time complexity of QuickSort?',
   'MCQ', '["O(n²)","O(n log n)","O(n)","O(log n)"]',
   'O(n²)', 'MEDIUM', 'QuickSort is O(n²) in the worst case (already sorted array with bad pivot selection).'),

  ('Which data structure is best for implementing a browser back button?',
   'MCQ', '["Stack","Queue","Heap","Graph"]',
   'Stack', 'MEDIUM', 'A stack perfectly models browser history — push new pages, pop to go back.')
) AS qu(text, type, opts, ans, diff, exp);

-- Python Quiz
WITH pyq AS (SELECT id FROM quizzes WHERE title = 'Python Basics Quiz' LIMIT 1)
INSERT INTO questions (quiz_id, question_text, type, options_json, correct_answer, difficulty, explanation, marks)
SELECT q.id, qu.text, qu.type, qu.opts::jsonb, qu.ans, qu.diff::varchar, qu.exp, 1
FROM pyq q
CROSS JOIN (VALUES
  ('What is the output of: print(type([]))?',
   'MCQ', '["<class ''list''>","<class ''array''>","[]","list"]',
   '<class ''list''>', 'EASY', 'type([]) returns the class type of a list in Python.'),

  ('Python uses indentation to define code blocks.',
   'TRUE_FALSE', '["True","False"]',
   'True', 'EASY', 'Python uses whitespace indentation instead of curly braces.'),

  ('Which keyword is used to define a function in Python?',
   'MCQ', '["def","function","fun","func"]',
   'def', 'EASY', 'Python uses the def keyword to define functions.'),

  ('What does the __init__ method do in Python?',
   'MCQ', '["Initializes a new object instance","Deletes an object","Imports a module","Handles exceptions"]',
   'Initializes a new object instance', 'MEDIUM', '__init__ is the constructor method, called when a new object is created.'),

  ('What is a Python list comprehension?',
   'MCQ', '["A concise way to create lists using a single line of code","A method to sort lists","A way to import lists","A built-in list function"]',
   'A concise way to create lists using a single line of code', 'MEDIUM', 'e.g. [x*2 for x in range(10)] creates a list of doubled values.')
) AS qu(text, type, opts, ans, diff, exp);
