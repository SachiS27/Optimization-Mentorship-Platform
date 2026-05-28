-- Seed Database Script for Mentorship Platform
-- Run this in Supabase SQL Editor to create mentor and initial student accounts

-- ⚠️ WARNING: Running this will clear existing users and recreate them
-- Comment out the DELETE line if you want to keep existing data

-- Optional: Clear existing data (comment out if you want to keep data)
-- DELETE FROM submissions;
-- DELETE FROM users;

-- Create mentor account
INSERT INTO users (email, name, password_hash, role)
VALUES ('mentor@program.in', 'Program Mentor', 'mentor123', 'mentor')
ON CONFLICT (email) DO NOTHING;

-- Create 9 student accounts
INSERT INTO users (email, name, password_hash, role)
VALUES
('student1@student.in', 'Arjun Sharma', 'pass123', 'student'),
('student2@student.in', 'Priya Verma', 'pass123', 'student'),
('student3@student.in', 'Rohan Gupta', 'pass123', 'student'),
('student4@student.in', 'Neha Patel', 'pass123', 'student'),
('student5@student.in', 'Vikram Singh', 'pass123', 'student'),
('student6@student.in', 'Ananya Iyer', 'pass123', 'student'),
('student7@student.in', 'Aditya Kumar', 'pass123', 'student'),
('student8@student.in', 'Sakshi Mehta', 'pass123', 'student'),
('student9@student.in', 'Rahul Joshi', 'pass123', 'student')
ON CONFLICT (email) DO NOTHING;

-- Verify the data was inserted
SELECT 'Mentor' as role, COUNT(*) as count FROM users WHERE role = 'mentor'
UNION ALL
SELECT 'Students' as role, COUNT(*) as count FROM users WHERE role = 'student';

-- Expected output:
-- role     | count
-- ---------|-------
-- Mentor   | 1
-- Students | 9
