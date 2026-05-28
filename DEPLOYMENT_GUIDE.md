# Mentorship Platform Deployment Guide
## Path 2: Vercel + Supabase (Real Website)

**Total Time: ~1 hour**  
**Difficulty: Zero coding needed — just clicks and copy-paste**

---

## ⏱️ Timeline Overview
- **Phase 1** (10 min): Create Supabase database
- **Phase 2** (10 min): Create Vercel account
- **Phase 3** (15 min): Deploy app
- **Phase 4** (10 min): Test locally
- **Phase 5** (5 min): Create student accounts
- **Phase 6** (10 min): Go live & share

---

## Phase 1: Set Up Supabase (Database + File Storage)

### Step 1.1: Create Supabase Account
1. Go to **https://supabase.com**
2. Click **"Start your project for free"** (top right)
3. Sign up with **GitHub** (easiest) or email
   - *If using email: verify your email address*

### Step 1.2: Create a New Project
1. After login, you'll see a dashboard
2. Click **"New project"** (or "+ New project" button)
3. Fill in:
   - **Project name:** `mentorship-program`
   - **Database password:** Create something random, save it somewhere safe (you won't need it again)
   - **Region:** Choose the one closest to India (e.g., `ap-south-1` if available, otherwise `us-east-1`)
4. Click **"Create new project"**
5. **Wait 2–3 minutes** for the database to spin up. You'll see a loading screen.

### Step 1.3: Create the Database Tables
Once the project loads, you'll see the Supabase dashboard.

**On the left sidebar, click "SQL Editor"**

Copy the SQL below, paste it into the editor, and click **"Run"**:

```sql
-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'mentor')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create submissions table
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_number INT NOT NULL CHECK (week_number BETWEEN 1 AND 8),
  file_name TEXT,
  file_url TEXT,
  reflection_text TEXT,
  submitted_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, week_number)
);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own row
CREATE POLICY "Users see own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- RLS Policy: Mentor can see all submissions, students see only their own
CREATE POLICY "Student see own submissions" ON submissions
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'mentor')
  );

CREATE POLICY "User can insert own submissions" ON submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User can update own submissions" ON submissions
  FOR UPDATE USING (auth.uid() = user_id);
```

✅ **You should see: "Executed successfully"**

### Step 1.4: Set Up File Storage Bucket
1. On the left sidebar, click **"Storage"**
2. Click **"Create new bucket"**
3. Name it: `submission-files`
4. Click **"Create bucket"**
5. Click on the bucket name to open it
6. On the right, click **"Policies"**
7. Click **"Create policy"** and choose **"For full customization, use custom templates"**
8. Copy-paste this policy:

```
(bucket_id = 'submission-files')
```

9. Click **"Review"** → **"Save policy"**

### Step 1.5: Get Your Supabase Credentials
1. On the left, click **"Project Settings"** (gear icon at bottom)
2. Click **"API"**
3. You'll see two values. **Copy both and save them somewhere safe** (notepad, email to yourself):
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon key** (a long string starting with `eyJ`)

✅ **Phase 1 done!**

---

## Phase 2: Set Up Vercel (Hosting)

### Step 2.1: Create Vercel Account
1. Go to **https://vercel.com**
2. Click **"Sign up"** (top right)
3. Choose **"Continue with GitHub"** (easiest)
   - *If you don't have GitHub, create one at github.com first, it takes 2 min*
4. Authorize Vercel to access your GitHub

### Step 2.2: Create a GitHub Repository
Since you'll deploy from GitHub, we need to create a repo for the code.

1. Go to **https://github.com/new**
2. Fill in:
   - **Repository name:** `mentorship-program`
   - **Description:** "Optimization Mentorship Platform"
   - **Private or Public:** Your choice (public is fine)
   - **Initialize with README:** Leave unchecked
3. Click **"Create repository"**
4. **Copy the HTTPS URL** (it'll look like `https://github.com/yourusername/mentorship-program.git`)

✅ **Phase 2 done!**

---

## Phase 3: Deploy the App

### Step 3.1: Upload Code to GitHub
I'll give you the production-ready code in the next section. For now, here's the easiest way to get it on GitHub without using terminal:

1. Go to your new GitHub repo
2. Click **"Add file"** → **"Upload files"**
3. **Drag and drop all the files** I'll provide into the browser
   - (Or use the file picker)
4. Click **"Commit changes"**

### Step 3.2: Deploy on Vercel
1. Go to **https://vercel.com/new**
2. Click **"Import Git Repository"**
3. Paste your GitHub repo URL (from Step 2.2)
4. Click **"Import"**
5. Vercel will ask for **"Environment Variables"**
   - Add these two (from Step 1.5):
     - **Name:** `NEXT_PUBLIC_SUPABASE_URL` → **Value:** Your Project URL
     - **Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY` → **Value:** Your anon key
6. Click **"Deploy"**
7. **Wait 3–5 minutes.** Vercel will build and deploy your site.
8. Once done, you'll see a green checkmark and a **live URL** like `https://mentorship-program.vercel.app`

✅ **Your site is now live!**

---

## Phase 4: Test Locally (Before Going Live)

### Step 4.1: Open Your Live Site
1. Click the Vercel URL from Step 3.2
2. You should see the login page
3. **Log in as mentor:**
   - Email: `mentor@program.in`
   - Password: `mentor123`
4. You should see an empty mentor dashboard (no students yet — that's next)

### Step 4.2: Create Student Accounts
You need to add the 9 students to the database. I'll provide an **admin account creation script** next. For now:

1. Still logged in as mentor
2. There will be a **"Manage Students"** button (or similar)
3. You'll be able to add email + password for each student
   - **9 students:** e.g., arjun@student.in, priya@student.in, etc.
   - **All use password:** `pass123` (you can change per-student later)

### Step 4.3: Test as a Student
1. Open the site in a **private/incognito browser window**
2. Log in as a student (e.g., `arjun@student.in` / `pass123`)
3. Upload a test file for Week 1
4. Write a reflection
5. Submit
6. Log back in as mentor in the **first window**
7. Refresh the mentor dashboard
8. **You should see the student's submission!**

✅ **Testing done!**

---

## Phase 5: Create Student Accounts

Once you've tested everything, add all 9 students:

**In the mentor dashboard, click "Manage Students" and add:**
1. arjun@student.in / pass123
2. priya@student.in / pass123
3. (... continue for 9 total)

---

## Phase 6: Go Live

1. Share the Vercel URL with your 9 students
2. They log in with their email + password
3. They start uploading submissions
4. You view everything from the mentor dashboard

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| **Site won't load** | Wait 5 more minutes. Check Vercel dashboard for build errors. |
| **Can't log in** | Make sure student account was created in "Manage Students" |
| **File upload fails** | Check Supabase Storage bucket permissions (see Step 1.4) |
| **Mentor dashboard blank** | Refresh the page. Check you're logged in as mentor role. |
| **Can't see Supabase URL/keys** | Go back to Supabase → Project Settings → API → Copy again. |

---

## 📋 Checklist Before Sharing with Students

- [ ] Supabase account created
- [ ] Database tables set up (SQL ran successfully)
- [ ] Storage bucket created + policies added
- [ ] Vercel account created + repo linked
- [ ] App deployed (green checkmark on Vercel)
- [ ] Can log in as mentor
- [ ] Can log in as student (test account)
- [ ] Can upload a file and see it in mentor dashboard
- [ ] All 9 students added to "Manage Students"
- [ ] Vercel URL shared with students

---

## Next Steps

Once you confirm this guide works, I'll give you:
1. ✅ **Production-ready code** (all files to upload)
2. ✅ **Student creation script** (to bulk-add 9 accounts)
3. ✅ **Testing checklist** (verify everything works)
4. ✅ **Admin manual** (how to download submissions, reset passwords, etc.)

**Ready to start Phase 1?**
