-- ========================
-- BATCHES
-- ========================
CREATE TABLE batches (
    id BIGSERIAL PRIMARY KEY,
    instructor_id BIGINT NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE batch_students (
    batch_id BIGINT NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (batch_id, student_id)
);

CREATE TABLE batch_course_assignments (
    id BIGSERIAL PRIMARY KEY,
    batch_id BIGINT REFERENCES batches(id) ON DELETE CASCADE,
    student_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT NOW(),
    due_date TIMESTAMP
);

CREATE TABLE batch_quiz_assignments (
    id BIGSERIAL PRIMARY KEY,
    batch_id BIGINT REFERENCES batches(id) ON DELETE CASCADE,
    student_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    quiz_id BIGINT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT NOW(),
    due_date TIMESTAMP,
    max_attempts INT DEFAULT 3
);

-- ========================
-- CHAT
-- ========================
CREATE TABLE chat_rooms (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES users(id),
    tutor_id BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, tutor_id)
);

CREATE TABLE chat_messages (
    id BIGSERIAL PRIMARY KEY,
    room_id BIGINT NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id BIGINT NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ========================
-- PROBLEM DISCUSSION
-- ========================
CREATE TABLE problem_comments (
    id BIGSERIAL PRIMARY KEY,
    problem_id BIGINT NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ========================
-- SEED: CODING PROBLEMS
-- ========================
INSERT INTO problems (title, description, example_input, example_output, constraints, topic, difficulty, acceptance_rate) VALUES
('Two Sum', 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.', '[2,7,11,15], target=9', '[0,1]', '2 <= nums.length <= 10^4', 'Arrays', 'EASY', 49),
('Best Time to Buy and Sell Stock', 'You are given an array prices where prices[i] is the price of a given stock on the ith day. Find the maximum profit.', '[7,1,5,3,6,4]', '5', '1 <= prices.length <= 10^5', 'Arrays', 'EASY', 54),
('Valid Parentheses', 'Given a string s containing just the characters ( ) { } [ ], determine if the input string is valid.', '"()[]{}"', 'true', '1 <= s.length <= 10^4', 'Strings', 'EASY', 40),
('Reverse Linked List', 'Given the head of a singly linked list, reverse the list, and return the reversed list.', '[1,2,3,4,5]', '[5,4,3,2,1]', 'The number of nodes in the list is in range [0, 5000]', 'LinkedList', 'EASY', 73),
('Merge Two Sorted Lists', 'Merge two sorted linked lists and return it as a sorted list.', '[1,2,4], [1,3,4]', '[1,1,2,3,4,4]', '0 <= Node.val <= 50', 'LinkedList', 'EASY', 62),
('Binary Search', 'Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums.', '[-1,0,3,5,9,12], target=9', '4', '1 <= nums.length <= 10^4', 'Binary Search', 'EASY', 55),
('Climbing Stairs', 'You are climbing a staircase. It takes n steps to reach the top. Each time you can climb 1 or 2 steps. How many distinct ways can you climb to the top?', '3', '3', '1 <= n <= 45', 'DP', 'EASY', 52),
('Longest Common Prefix', 'Write a function to find the longest common prefix string amongst an array of strings.', '["flower","flow","flight"]', '"fl"', '1 <= strs.length <= 200', 'Strings', 'EASY', 41),
('Maximum Depth of Binary Tree', 'Given the root of a binary tree, return its maximum depth.', '[3,9,20,null,null,15,7]', '3', '0 <= Node.val <= 100', 'Trees', 'EASY', 73),
('Symmetric Tree', 'Given the root of a binary tree, check whether it is a mirror of itself.', '[1,2,2,3,4,4,3]', 'true', 'The number of nodes in the tree is in range [1, 1000]', 'Trees', 'EASY', 52),
('Add Two Numbers', 'You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order.', '[2,4,3], [5,6,4]', '[7,0,8]', '1 <= nodes <= 100', 'LinkedList', 'MEDIUM', 41),
('Longest Substring Without Repeating Characters', 'Given a string s, find the length of the longest substring without repeating characters.', '"abcabcbb"', '3', '0 <= s.length <= 5 * 10^4', 'Strings', 'MEDIUM', 34),
('3Sum', 'Given an integer array nums, return all the triplets such that nums[i] + nums[j] + nums[k] == 0.', '[-1,0,1,2,-1,-4]', '[[-1,-1,2],[-1,0,1]]', '3 <= nums.length <= 3000', 'Arrays', 'MEDIUM', 33),
('Container With Most Water', 'Given n non-negative integers, find two lines that together with the x-axis forms a container that contains the most water.', '[1,8,6,2,5,4,8,3,7]', '49', '2 <= height.length <= 10^5', 'Arrays', 'MEDIUM', 54),
('Coin Change', 'Given an array of coins and an amount, compute the fewest number of coins needed to make up that amount.', 'coins=[1,5,11], amount=11', '1', '1 <= coins.length <= 12', 'DP', 'MEDIUM', 43),
('Number of Islands', 'Given an m x n 2D binary grid, return the number of islands.', '[["1","1","0"],["0","1","0"]]', '1', '1 <= grid dimensions <= 300', 'Graphs', 'MEDIUM', 57),
('Word Search', 'Given an m x n grid of characters board and a string word, return true if word exists in the grid.', 'board=[["A","B"],["C","D"]], word="ABDC"', 'true', '1 <= m, n <= 6', 'Recursion', 'MEDIUM', 41),
('LRU Cache', 'Design a data structure that follows the constraints of a Least Recently Used cache.', 'capacity=2, operations=[put,put,get,put,get,get]', '[-1,3]', '1 <= capacity <= 3000', 'Arrays', 'MEDIUM', 41),
('Merge Intervals', 'Given an array of intervals, merge all overlapping intervals.', '[[1,3],[2,6],[8,10],[15,18]]', '[[1,6],[8,10],[15,18]]', '1 <= intervals.length <= 10^4', 'Sorting', 'MEDIUM', 46),
('Decode Ways', 'A message containing letters A-Z can be encoded. Given a string of digits, count the number of ways to decode it.', '"226"', '3', '1 <= s.length <= 100', 'DP', 'MEDIUM', 32),
('Median of Two Sorted Arrays', 'Given two sorted arrays nums1 and nums2, return the median of the two sorted arrays.', '[1,3], [2]', '2.0', 'm + n >= 1', 'Binary Search', 'HARD', 38),
('Trapping Rain Water', 'Given n non-negative integers representing an elevation map, compute how much water it can trap after raining.', '[0,1,0,2,1,0,1,3,2,1,2,1]', '6', '1 <= height.length <= 2*10^4', 'Arrays', 'HARD', 58),
('Word Ladder', 'Given two words beginWord and endWord and a dictionary, find the length of the shortest transformation sequence.', 'beginWord="hit", endWord="cog", wordList=["hot","dot","dog","lot","log","cog"]', '5', '1 <= wordList.length <= 5000', 'Graphs', 'HARD', 38),
('Serialize and Deserialize Binary Tree', 'Design an algorithm to serialize and deserialize a binary tree.', '[1,2,3,null,null,4,5]', '[1,2,3,null,null,4,5]', 'The number of nodes in the tree is in range [0, 10^4]', 'Trees', 'HARD', 55),
('Edit Distance', 'Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2.', 'word1="horse", word2="ros"', '3', '0 <= word1.length, word2.length <= 500', 'DP', 'HARD', 52);

-- Add company tags
INSERT INTO problem_company_tags (problem_id, company)
SELECT p.id, c.company FROM problems p
CROSS JOIN (VALUES ('Google'), ('Amazon'), ('Facebook')) AS c(company)
WHERE p.title IN ('Two Sum', 'Median of Two Sorted Arrays', 'Trapping Rain Water');

INSERT INTO problem_company_tags (problem_id, company)
SELECT p.id, c.company FROM problems p
CROSS JOIN (VALUES ('Amazon'), ('Microsoft')) AS c(company)
WHERE p.title IN ('LRU Cache', 'Merge Intervals', 'Word Search');

INSERT INTO problem_company_tags (problem_id, company)
SELECT p.id, 'Microsoft' FROM problems p
WHERE p.title IN ('Coin Change', 'Edit Distance', 'Climbing Stairs');
