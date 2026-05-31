-- ============================================
-- Run this in Supabase SQL Editor
-- Creates submission_feedback table
-- ============================================

-- 1. Create table
CREATE TABLE IF NOT EXISTS submission_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  week_number INTEGER NOT NULL CHECK (week_number >= 1 AND week_number <= 8),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_number)
);

-- 2. Enable RLS
ALTER TABLE submission_feedback ENABLE ROW LEVEL SECURITY;

-- 3. Anyone authenticated can read
CREATE POLICY "Anyone can read feedback"
  ON submission_feedback FOR SELECT
  USING (true);

-- 4. Mentors can insert feedback
CREATE POLICY "Mentors can insert feedback"
  ON submission_feedback FOR INSERT
  WITH CHECK (true);

-- 5. Mentors can update feedback
CREATE POLICY "Mentors can update feedback"
  ON submission_feedback FOR UPDATE
  USING (true);
