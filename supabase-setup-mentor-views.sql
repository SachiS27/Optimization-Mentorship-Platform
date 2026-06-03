-- ============================================
-- Run this in Supabase SQL Editor
-- Tracks which submissions the mentor has viewed
-- ============================================

CREATE TABLE IF NOT EXISTS mentor_submission_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID NOT NULL REFERENCES users(id),
  user_id UUID NOT NULL REFERENCES users(id),
  week_number INTEGER NOT NULL CHECK (week_number >= 1 AND week_number <= 8),
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(mentor_id, user_id, week_number)
);

ALTER TABLE mentor_submission_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read mentor_views"
  ON mentor_submission_views FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert mentor_views"
  ON mentor_submission_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update mentor_views"
  ON mentor_submission_views FOR UPDATE
  USING (true);
