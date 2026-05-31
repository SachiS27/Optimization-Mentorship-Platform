-- ============================================
-- Run this in Supabase SQL Editor
-- Updates student names and mentor name
-- ============================================

-- Update student names
UPDATE users SET name = 'Kaira' WHERE email = '24b4514@iitb.ac.in';
UPDATE users SET name = 'Parav' WHERE email = '24b4515@iitb.ac.in';
UPDATE users SET name = 'Anant' WHERE email = '24b4530@iitb.ac.in';
UPDATE users SET name = 'Prakhar' WHERE email = '25b3007@iitb.ac.in';
UPDATE users SET name = 'Sasmit' WHERE email = '25b0040@iitb.ac.in';
UPDATE users SET name = 'Shubham' WHERE email = '24b1226@iitb.ac.in';
UPDATE users SET name = 'Sahasra' WHERE email = '24b4536@iitb.ac.in';
UPDATE users SET name = 'Parth' WHERE email = '25b0416@iitb.ac.in';
UPDATE users SET name = 'Varun' WHERE email = '24b2464@iitb.ac.in';

-- Update mentor name (optional - change 'Your Name' to your actual name)
UPDATE users SET name = 'Mentor' WHERE email = 'mentor@program.in';
