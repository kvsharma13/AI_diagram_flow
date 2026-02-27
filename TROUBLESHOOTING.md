# 🔧 Troubleshooting Guide

## ❌ "Failed to Create Project" Error

This error happens because the database isn't set up yet. Here's how to fix it:

---

## ✅ Quick Fix (3 Steps):

### Step 1: Check Your Setup
Visit: **http://localhost:3000/setup-check**

This will show you what's missing!

---

### Step 2: Get Supabase Service Role Key

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **Settings** (gear icon) → **API**
4. Scroll to "Project API keys"
5. Find **service_role** key
6. Click "Reveal" and copy it
7. Add to `.env.local`:
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your_key_here
```

---

### Step 3: Run Database Schema

1. Go to Supabase Dashboard
2. Click **SQL Editor** in left sidebar
3. Click **New Query**
4. Open `/supabase/schema.sql` file in your project
5. Copy ALL the contents (entire file)
6. Paste into Supabase SQL Editor
7. Click **Run** button (or press Cmd+Enter)
8. Wait for "Success" message

---

### Step 4: Restart Your Server

```bash
# Stop current server (Ctrl+C)
# Then restart:
npm run dev
```

---

### Step 5: Test Again

1. Go to `/dashboard/projects/new`
2. Enter project name
3. Click "Create Project"
4. Should work now! ✅

---

## 🧪 Verify It's Fixed:

Visit: **http://localhost:3000/setup-check**

All checks should be ✅ green!

---

## Other Common Errors:

### "Unauthorized" or "Not signed in"
**Fix:** Make sure Clerk keys are in `.env.local`
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### "AI generation failed"
**Fix:** Check OpenAI key (already in `.env.local`)

### "Payment failed"
**Fix:** Add Razorpay keys (optional for testing):
```env
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
```

---

## 📋 Complete .env.local Checklist:

```env
# ✅ You have these:
OPENAI_API_KEY=sk-proj-...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...

# ❌ You're missing this (NEEDED):
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# ⚠️ Optional (for payments):
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
```

---

## 🆘 Still Not Working?

### Check Console Errors:
Open browser DevTools (F12) → Console tab
Look for red error messages and share them with me!

### Check Terminal Output:
Look in your terminal where `npm run dev` is running
Share any error messages you see

### Common Issues:

**"relation 'users' does not exist"**
→ Database schema not run. Go to Step 3 above.

**"Invalid API key"**
→ Check your Supabase keys are correct

**"Failed to connect to database"**
→ Check `SUPABASE_SERVICE_ROLE_KEY` is set

---

## ✅ Working Checklist:

After fixing, you should be able to:
- [ ] Visit `/setup-check` → All green ✅
- [ ] Create new project → Works
- [ ] Open project → Loads editor
- [ ] Make changes → Auto-saves
- [ ] Refresh page → Changes persist

---

## 💬 Need More Help?

Just tell me:
1. What error message you see
2. Which step you're stuck on
3. Screenshot if possible

I'll help you fix it! 🚀
