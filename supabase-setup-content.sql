-- ============================================
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Create weekly_content table (mentor uploads)
CREATE TABLE IF NOT EXISTS weekly_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  week_number INTEGER NOT NULL CHECK (week_number >= 1 AND week_number <= 8),
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by UUID REFERENCES users(id)
);

-- 2. Create content_views table (tracks student views)
CREATE TABLE IF NOT EXISTS content_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID REFERENCES weekly_content(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(content_id, user_id)
);

-- 3. Enable RLS
ALTER TABLE weekly_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_views ENABLE ROW LEVEL SECURITY;

-- 4. RLS policies for weekly_content
-- Anyone authenticated can read
CREATE POLICY "Anyone can read weekly_content"
  ON weekly_content FOR SELECT
  USING (true);

-- Only mentors can insert/update/delete
CREATE POLICY "Mentors can insert weekly_content"
  ON weekly_content FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = uploaded_by AND role = 'mentor')
  );

CREATE POLICY "Mentors can update weekly_content"
  ON weekly_content FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = uploaded_by AND role = 'mentor')
  );

CREATE POLICY "Mentors can delete weekly_content"
  ON weekly_content FOR DELETE
  USING (true);

-- 5. RLS policies for content_views
-- Students can insert their own views
CREATE POLICY "Students can insert own views"
  ON content_views FOR INSERT
  WITH CHECK (true);

-- Anyone can read views (mentor needs to see all)
CREATE POLICY "Anyone can read content_views"
  ON content_views FOR SELECT
  USING (true);
