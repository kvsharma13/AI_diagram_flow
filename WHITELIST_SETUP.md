# 🔐 Whitelist Setup - Give Yourself Unlimited Access

## What I've Implemented:

### ✅ YOU (Whitelisted User):
- **Everything unlimited**
- **No payment required**
- **Bypass all checks**
- **999 AI generations** (unlimited)

### ❌ Everyone Else (New Users):
- **Must pay before using ANYTHING**
- **Two pricing tiers:**
  - **₹900/month** = 5 AI imports (Gantt + RACI combined)
  - **₹2000/month** = 12 AI imports (Gantt + RACI combined)
- **After paying:** Unlimited manual editing, code imports, projects
- **Only AI is limited** based on plan

---

## 🎯 Step 1: Get Your Clerk User ID

### Option A: From Dashboard (Easiest)

1. Make sure you're signed in
2. Open browser DevTools (F12)
3. Go to Console tab
4. Paste this and press Enter:
```javascript
console.log(window.location.href)
```
5. Then go to **Application** tab → **Cookies** → Look for `__session` cookie
6. Or easier - just run this in console:
```javascript
fetch('/api/user-id').then(r => r.json()).then(d => console.log('Your User ID:', d))
```

### Option B: From Clerk Dashboard

1. Go to: https://dashboard.clerk.com
2. Click on **Users**
3. Find yourself in the list
4. Click on your user
5. Copy the **User ID** (starts with `user_`)

### Option C: I'll Create a Helper Page

Visit: **http://localhost:3000/get-my-id**
(I'll create this for you if you want)

---

## 🎯 Step 2: Add Your ID to Whitelist

Open `/lib/config.ts` and replace this:

```typescript
export const WHITELISTED_USERS = [
  'user_2r9ZWXrj8KiL6n5VYQZx1MxQWKE', // Replace with your actual Clerk user ID
  'your-email@example.com', // Or your email
];
```

With your actual ID:

```typescript
export const WHITELISTED_USERS = [
  'user_YOUR_ACTUAL_ID_HERE', // Your Clerk user ID
  'youremail@gmail.com', // Your actual email
];
```

---

## 🎯 Step 3: Restart Server

```bash
# Stop server (Ctrl+C)
npm run dev
```

---

## 🎯 Step 4: Test Your Access

1. **Visit:** http://localhost:3000/dashboard
2. **Should see:** Full access, no subscription required
3. **Try AI import:** Should show "999/999" credits (unlimited)
4. **Try creating projects:** Should work without payment

---

## 🧪 Step 5: Test New User Flow

To test how new users will experience it:

1. **Sign out** from your account
2. **Create a new account** with different email
3. **Try to access dashboard** → Should redirect to pricing
4. **Should see:** Two pricing tiers (₹900 and ₹2000)
5. **Cannot use anything** until they pay

---

## 📝 What Each File Does:

### `/lib/config.ts`
- Stores your whitelisted user IDs
- Defines pricing tiers
- Helper functions to check whitelist status

### `/lib/checkSubscription.ts`
- Checks if user is whitelisted
- Checks subscription status for non-whitelisted users
- Returns access permissions

### `/app/api/check-subscription/route.ts`
- API endpoint to check user's subscription status
- Used by dashboard to determine access

### `/app/api/ai-generate/route.ts` (Updated)
- Checks if user is whitelisted
- Whitelisted = unlimited AI
- Others = plan-based limits (5 or 12)

### `/app/dashboard/page.tsx` (Updated)
- Checks subscription on load
- Redirects to pricing if no subscription
- Shows access for whitelisted users

---

## 🎨 Pricing Page (Next Step)

I still need to update `/app/pricing/page.tsx` to show:
- Two pricing tiers side by side
- ₹900/month (5 AI imports)
- ₹2000/month (12 AI imports)
- Let users choose which plan to subscribe to

**Do you want me to update the pricing page now?**

---

## ⚠️ Important Notes:

1. **Database Update Needed:**
   - Need to add `subscription_plan_type` column
   - Run this SQL in Supabase:
   ```sql
   ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_plan_type TEXT DEFAULT 'basic';
   ```

2. **Razorpay Plans:**
   - You'll need to create TWO plans in Razorpay:
     - Plan 1: ₹900/month
     - Plan 2: ₹2000/month
   - Get their plan IDs and update `/lib/config.ts`

3. **Your Clerk User ID:**
   - Find it using steps above
   - Add to whitelist
   - Restart server

---

## 🚀 Quick Start:

**Tell me:**
1. "Show me my user ID" - I'll create a helper page
2. "Update pricing page" - I'll add two-tier pricing
3. "I have my ID: user_xxx" - I'll add it for you

**What do you want to do first?** 🎯
