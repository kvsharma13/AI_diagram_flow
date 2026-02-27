# How to Find Missing Keys

## ✅ Already Have:
- Clerk keys
- Supabase URL and anon key

## 🔍 Still Need:

### 1. Supabase Service Role Key (IMPORTANT)

**Where to find:**
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **Settings** (gear icon) in left sidebar
4. Click **API** section
5. Scroll down to **Project API keys**
6. Find **service_role** key (marked as "secret")
7. Click "Reveal" and copy it
8. Add to `.env.local` as: `SUPABASE_SERVICE_ROLE_KEY=eyJ...`

**⚠️ WARNING:** This is a SECRET key - never commit to git or share publicly!

---

### 2. Razorpay API Keys

**Where to find:**
1. Go to [https://dashboard.razorpay.com](https://dashboard.razorpay.com/app/dashboard)
2. **First time?** Create account:
   - Click "Sign Up"
   - Enter business details
   - You can test without KYC approval (use TEST mode)

3. **Switch to TEST Mode:**
   - Look at top-left corner
   - Make sure it says "Test Mode" (toggle if needed)
   - We'll use test mode for development

4. **Get API Keys:**
   - Go to **Settings** → **API Keys**
   - Or direct link: [https://dashboard.razorpay.com/app/keys](https://dashboard.razorpay.com/app/keys)
   - Click **Generate Test Key** (if none exist)
   - You'll see:
     - **Key ID**: Starts with `rzp_test_...` (this is PUBLIC, safe to expose)
     - **Key Secret**: Hidden by default (this is SECRET)
   - Click "Reveal" next to Key Secret and copy

5. **Add to `.env.local`:**
```env
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXX
RAZORPAY_KEY_SECRET=YYYYYYYYYYYYYY
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXX
```

6. **Webhook Secret (Do Later):**
   - We'll set this up after deploying
   - For now, leave as `TEMPORARY`

---

## Quick Copy-Paste Template:

Once you get the keys, update `.env.local`:

```env
# Supabase - ADD THIS KEY
SUPABASE_SERVICE_ROLE_KEY=paste_here

# Razorpay - ADD THESE KEYS
RAZORPAY_KEY_ID=rzp_test_paste_here
RAZORPAY_KEY_SECRET=paste_here
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_paste_here
```

---

## Restart Server After Adding Keys:

```bash
# Stop current server (Ctrl+C in terminal)
# Then restart:
npm run dev
```

---

## Testing Without Razorpay (Optional):

If you want to test auth and database features first without payment:
- Leave Razorpay keys as `TEMPORARY`
- You can test sign-in/sign-up
- Skip the pricing/payment flow for now
- Add Razorpay keys later when ready

---

## Need Help?

**Supabase not showing service role key?**
- Make sure you're in the right project
- Check you're looking at Settings → API (not Database)

**Razorpay not showing keys?**
- Verify you're in Test Mode (top-left toggle)
- Some countries require business verification even for test mode
- Try logging out and back in

**Still stuck?**
Let me know which specific key you can't find!
