# Mentorship Platform
## Resilient Multi-Echelon Inventory Optimization Program

A full-stack web application for managing 8-week mentorship programs with student submissions, mentor dashboards, and file management.

---

## ✨ Features

✅ **Student Dashboard**
- Weekly submission tracking (Week 1–8)
- File upload support (PDF, DOCX, ZIP, Jupyter notebooks, Python files)
- Reflection text fields
- Progress visualization
- Mobile responsive design

✅ **Mentor Dashboard**
- View all students and their submission status
- Download student files
- Read reflections
- Manage student accounts
- Bulk student creation

✅ **Security & Privacy**
- Email + password authentication
- Row-level security (RLS) in Supabase
- Students can only see their own work
- Mentor can view all submissions

✅ **File Storage**
- Secure file uploads to Supabase Storage
- 500MB free tier (plenty for 9 students × 8 weeks)
- Organized by student/week

---

## 📋 Prerequisites

Before deploying, you need:
- **Supabase project** (database + storage) ✓ Already done
- **GitHub account & repository** ✓ Already done
- **Vercel account** ✓ Already done
- **Supabase credentials** (URL + anon key) ✓ Already have

---

## 🚀 Deployment (Phase 3)

### Step 1: Upload Code to GitHub

1. Download all the files from this folder
2. Go to your GitHub repo: `https://github.com/SachiS27/Optimization-Mentorship-Platform`
3. Click **"Add file"** → **"Upload files"**
4. Drag and drop all files into the browser
5. Click **"Commit changes"**

**Files to upload:**
```
package.json
next.config.js
tailwind.config.js
postcss.config.js
.gitignore
.env.example
pages/
  _app.js
  index.js
  dashboard.js
  mentor.js
lib/
  supabase.js
styles/
  globals.css
```

### Step 2: Deploy on Vercel

1. Go to your Vercel project dashboard
2. Click **"Deployments"** in the left sidebar
3. Vercel will automatically detect the GitHub push and start building
4. Wait 3–5 minutes for the deployment to complete
5. Once complete, you'll see a green checkmark and a URL like:
   - `https://optimization-mentorship-platform.vercel.app`

### Step 3: Test the Deployment

1. Click the Vercel URL to open your live site
2. **Log in as mentor:**
   - Email: `mentor@program.in`
   - Password: `mentor123`
3. You should see the mentor dashboard (empty students list for now)

---

## 👥 Creating Student Accounts

### Option A: Via Mentor Dashboard (Recommended)

1. Log in as mentor
2. Click **"Add Student"** button
3. Fill in:
   - Student Name: e.g., "Arjun Sharma"
   - Email: e.g., "arjun@student.in"
   - Password: e.g., "pass123"
4. Click **"Add Student"**
5. Repeat for all 9 students

### Option B: Bulk SQL Insert (Advanced)

Go to **Supabase** → **SQL Editor** and run:

```sql
INSERT INTO users (email, name, password_hash, role) VALUES
('student1@student.in', 'Student 1', 'pass123', 'student'),
('student2@student.in', 'Student 2', 'pass123', 'student'),
('student3@student.in', 'Student 3', 'pass123', 'student'),
('student4@student.in', 'Student 4', 'pass123', 'student'),
('student5@student.in', 'Student 5', 'pass123', 'student'),
('student6@student.in', 'Student 6', 'pass123', 'student'),
('student7@student.in', 'Student 7', 'pass123', 'student'),
('student8@student.in', 'Student 8', 'pass123', 'student'),
('student9@student.in', 'Student 9', 'pass123', 'student');
```

---

## 🧪 Testing Checklist

- [ ] Mentor login works (mentor@program.in / mentor123)
- [ ] Student login works (any student account / pass123)
- [ ] Can see Week 1–8 cards on student dashboard
- [ ] Can upload a file and write reflection
- [ ] File appears in mentor dashboard
- [ ] Can download file from mentor view
- [ ] Navigation between pages works
- [ ] Mobile responsive (test on phone)
- [ ] All 9 students created successfully

---

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| **"NEXT_PUBLIC_SUPABASE_URL not found"** | Environment variables not set. Go to Vercel → Settings → Environment Variables and add them. |
| **"Can't log in as student"** | Student account doesn't exist. Add via "Manage Students" in mentor dashboard. |
| **"File upload fails"** | Check Supabase Storage bucket permissions. Go to Supabase → Storage → Policies. |
| **"Deployment fails"** | Check Vercel logs: Deployments → Failed deployment → Logs. |
| **"Site shows 404"** | Wait 5 minutes for deployment to finish. Refresh the page. |

---

## 📁 Project Structure

```
pages/
├── _app.js           # Next.js app wrapper
├── index.js          # Login page
├── dashboard.js      # Student dashboard
└── mentor.js         # Mentor dashboard

lib/
└── supabase.js       # Supabase client

styles/
└── globals.css       # Global Tailwind styles

package.json          # Dependencies
tailwind.config.js    # Tailwind config
next.config.js        # Next.js config
```

---

## 🔐 Security Notes

⚠️ **Important:**
- Passwords are stored as plain text (for demo purposes)
- For production, use `bcrypt` for password hashing
- Never commit `.env.local` to GitHub (it's in `.gitignore`)
- Supabase RLS policies prevent students from seeing other students' data
- Only mentors can view all submissions

---

## 📞 Support

If something breaks:
1. Check Vercel logs: Vercel dashboard → Deployments → Click failed deploy → Logs
2. Check Supabase: Supabase dashboard → SQL Editor → Run test queries
3. Check GitHub: Make sure all files were uploaded correctly
4. Verify environment variables in Vercel are correct

---

## Next Steps (Optional)

Once the platform is live and working:

1. **Add password hashing** (use `bcrypt` library)
2. **Add email confirmations** (use SendGrid or Mailgun)
3. **Add feedback submission** (mentor can leave comments on submissions)
4. **Add deadline tracking** (soft deadlines with notifications)
5. **Add analytics** (submission trends, completion rates)

---

**Built with:**
- Next.js 14 (React framework)
- Supabase (Database + Storage)
- Tailwind CSS (Styling)
- Vercel (Hosting)

Good luck with your mentorship program! 🚀
