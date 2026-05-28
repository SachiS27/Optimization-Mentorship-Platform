# Step-by-Step Setup for Production

This document walks you through uploading code and deploying the app.

---

## ✅ What You Already Have

- ✅ Supabase project with database and storage bucket
- ✅ Supabase credentials (URL + anon key)
- ✅ GitHub repository created
- ✅ Vercel account created

---

## 📤 Step 1: Download Code Files

All the code is ready. Here's what you need to upload to GitHub:

**Core files:**
- `package.json`
- `next.config.js`
- `tailwind.config.js`
- `postcss.config.js`
- `.gitignore`
- `.env.example`
- `README.md`

**Folders:**
- `pages/` (all files inside)
- `lib/` (all files inside)
- `styles/` (all files inside)

---

## 📤 Step 2: Upload to GitHub

1. **Go to your repository:**
   ```
   https://github.com/SachiS27/Optimization-Mentorship-Platform
   ```

2. **Click "Add file" → "Upload files"** (top right)

3. **Drag and drop** all the files and folders into the browser window
   - Or use the file picker to select them

4. **Write commit message:**
   ```
   Initial commit: Add Next.js mentorship platform
   ```

5. **Click "Commit changes"**

6. **Wait 10 seconds** for the files to upload

---

## 🚀 Step 3: Vercel Auto-Deploys

Once you push to GitHub, Vercel automatically:
1. Detects the new code
2. Builds the Next.js app
3. Deploys to production

**Check the deployment:**
1. Go to **Vercel dashboard** → Your project
2. Click **"Deployments"** tab
3. Wait for the status to change from "Building..." to "Ready"
4. Once it's green with a checkmark, your site is live!

**Your live URL will be:**
```
https://optimization-mentorship-platform.vercel.app
```

---

## 🧪 Step 4: Test Your Site

1. **Click the Vercel URL** to open your live site
2. **Log in as mentor:**
   - Email: `mentor@program.in`
   - Password: `mentor123`
3. You should see the mentor dashboard with an empty student list

### If you see a login page but can't log in:

**Problem:** Mentor account doesn't exist

**Solution:** Run this in Supabase SQL Editor:

```sql
INSERT INTO users (email, name, password_hash, role) VALUES (
  'mentor@program.in',
  'Program Mentor',
  'mentor123',
  'mentor'
);
```

---

## 👥 Step 5: Add Students

Use the **"Add Student"** button in the mentor dashboard:

1. Click **"Add Student"** (blue button)
2. Fill in:
   - **Student Name:** e.g., "Arjun Sharma"
   - **Email:** e.g., "arjun@student.in"
   - **Password:** e.g., "pass123"
3. Click **"Add Student"**
4. **Repeat 9 times** for all students

**Or use this SQL to bulk-add students:**

Go to **Supabase** → **SQL Editor** and run:

```sql
INSERT INTO users (email, name, password_hash, role) VALUES
('student1@student.in', 'Student One', 'pass123', 'student'),
('student2@student.in', 'Student Two', 'pass123', 'student'),
('student3@student.in', 'Student Three', 'pass123', 'student'),
('student4@student.in', 'Student Four', 'pass123', 'student'),
('student5@student.in', 'Student Five', 'pass123', 'student'),
('student6@student.in', 'Student Six', 'pass123', 'student'),
('student7@student.in', 'Student Seven', 'pass123', 'student'),
('student8@student.in', 'Student Eight', 'pass123', 'student'),
('student9@student.in', 'Student Nine', 'pass123', 'student');
```

After running, **refresh the mentor dashboard** and you'll see all 9 students!

---

## ✅ Final Testing

1. **Log in as mentor** — see all 9 students
2. **Log in as student1@student.in** (password: pass123)
3. **Click Week 1** card
4. **Upload a test file** (any PDF or text file)
5. **Write a reflection**
6. **Click "Submit"**
7. **Log back in as mentor**
8. **Click on Student One** from the list
9. **Verify you can see the Week 1 submission** with the file download link
10. **Click "Download"** to test file download

If all 10 steps work, you're done! 🎉

---

## 🆘 Troubleshooting

### "Site won't load"
- Wait 5 minutes for Vercel deployment to finish
- Refresh the page
- Check Vercel logs: Deployments → Click deployment → Logs

### "Can't log in as mentor"
- Run the SQL insert for mentor account (see Step 4)
- Check you typed the email and password exactly

### "Can't see students in mentor dashboard"
- Make sure students were added (use SQL bulk insert)
- Refresh the page
- Check Supabase database: Tables → users → verify students are there

### "File upload fails"
- Check Supabase Storage permissions (should have been set during initial setup)
- Try uploading a small file (< 5MB)

### "Download file button doesn't work"
- Make sure a file was actually uploaded
- Check Supabase Storage bucket: see if files are there

---

## 📱 Share with Students

Once everything is tested and working:

1. **Copy the Vercel URL:**
   ```
   https://optimization-mentorship-platform.vercel.app
   ```

2. **Share login credentials with each student:**
   ```
   Email: student1@student.in
   Password: pass123
   ```

3. **Share login link and simple instructions:**
   ```
   Go to: [VERCEL_URL]
   Log in with your email and password
   Click Week 1, upload your submission, click Submit
   Repeat for all 8 weeks
   ```

---

## 🎉 You're Done!

Your mentorship platform is now live and ready for students to use. They can:
- ✅ Log in anytime
- ✅ Submit work for Weeks 1–8
- ✅ Upload files and write reflections
- ✅ See their progress

You (the mentor) can:
- ✅ View all submissions
- ✅ Download student files
- ✅ Track completion
- ✅ Add/manage students

Enjoy your program! 🚀

---

## Questions?

If anything doesn't work:
1. Check the **Troubleshooting** section above
2. Look at Vercel logs for build/deployment errors
3. Check Supabase dashboard to verify database is set up correctly
4. Verify environment variables are set in Vercel (Settings → Environment Variables)
