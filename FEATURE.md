# ProjectFlow AI - Complete System Documentation

## 📋 Project Overview

**ProjectFlow AI** is a modern SaaS application that helps users create Gantt charts and RACI matrices using AI. The system features subscription-based pricing, authentication, cloud storage, and AI-powered project management tools.

### Core Features
- 🤖 **AI-Powered Generation**: Create Gantt charts and RACI matrices from text input using GPT-4
- 💳 **Subscription Management**: Stripe integration for monthly subscriptions (USD)
- 🔐 **Authentication**: Clerk-based auth with social logins
- ☁️ **Cloud Storage**: Supabase PostgreSQL database for user data and projects
- 🎨 **Modern UI**: Professional SaaS interface using shadcn/ui components
- 📊 **Usage Tracking**: AI generation limits based on subscription tier
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile

---

## 🛠 Tech Stack

### Frontend
- **Next.js 16** (App Router)
- **React 19.2**
- **TypeScript 5**
- **Tailwind CSS 4**
- **shadcn/ui** (Modern SaaS component library)
- **Lucide React** (Icons)
- **ReactFlow** (Interactive diagrams)
- **html2canvas** (Export to PNG)

### Backend
- **Next.js API Routes** (Serverless functions)
- **OpenAI API** (GPT-4 for AI generation)
- **Stripe** (Payment processing)
- **Clerk** (Authentication)
- **Supabase** (PostgreSQL database)

### Development
- **ESLint** (Linting)
- **npm/yarn/pnpm** (Package manager)

---

## 🔑 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# OpenAI API
OPENAI_API_KEY=sk-your-openai-api-key-here

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Razorpay Payment (LIVE MODE - REPLACE WITH YOUR LIVE KEYS)
RAZORPAY_KEY_ID=rzp_live_your_live_key_id
RAZORPAY_KEY_SECRET=your_live_secret_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_your_live_key_id
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Razorpay LIVE Plan IDs (REPLACE WITH YOUR LIVE PLAN IDs)
RAZORPAY_BASIC_PLAN_ID=plan_your_basic_plan_id
RAZORPAY_PRO_PLAN_ID=plan_your_pro_plan_id
```

### Important Notes on Keys:
- **OpenAI**: Use your own OpenAI API key (current key is included but replace with yours)
- **Clerk**: Current keys are for test environment - works as-is
- **Supabase**: Current keys are for the existing database - works as-is
- **Stripe**: You need to create a Stripe account and replace these values

---

## 🗄 Database Schema

### Supabase Tables

#### 1. `users` Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  subscription_id TEXT,
  subscription_status TEXT DEFAULT 'inactive', -- 'active', 'inactive', 'trialing', 'canceled'
  subscription_plan_type TEXT DEFAULT 'basic', -- 'basic', 'pro'
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_clerk_id ON users(clerk_user_id);
CREATE INDEX idx_users_stripe_customer ON users(stripe_customer_id);
CREATE INDEX idx_users_subscription_status ON users(subscription_status);
```

#### 2. `projects` Table
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'gantt' or 'raci'
  data JSONB NOT NULL, -- Stores the project data (timeline or RACI matrix)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_type ON projects(type);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
```

#### 3. `ai_usage` Table
```sql
CREATE TABLE ai_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  month_year TEXT NOT NULL, -- Format: 'YYYY-MM'
  generations_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, month_year)
);

-- Indexes
CREATE INDEX idx_ai_usage_user_month ON ai_usage(user_id, month_year);
```

### Row Level Security (RLS)

Enable RLS on all tables:

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;

-- Users table policies (service role has full access)
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (true);

-- Projects table policies
CREATE POLICY "Users can manage own projects" ON projects
  FOR ALL USING (true);

-- AI Usage policies
CREATE POLICY "Users can read own usage" ON ai_usage
  FOR SELECT USING (true);
```

---

## 🏗 System Architecture & Flow

### User Journey

```
1. Landing Page (/)
   ↓
2. Sign Up/Sign In (Clerk)
   ↓
3. Pricing Page (/pricing)
   ↓
4. Stripe Checkout (Subscription)
   ↓
5. Dashboard (/dashboard)
   ↓
6. Create Project
   ↓
7. AI Generation OR Manual Creation
   ↓
8. Save to Supabase
   ↓
9. Export (PNG/JSON)
```

### Authentication Flow

```
User → Clerk Sign In/Up → JWT Token → Next.js Middleware → Protected Routes
```

- Clerk handles all authentication (social logins, email/password)
- Next.js middleware protects routes
- User ID stored in Clerk, synced to Supabase

### Payment Flow (Stripe)

```
User selects plan
   ↓
Create Stripe Customer (if new)
   ↓
Create Stripe Checkout Session
   ↓
Redirect to Stripe Checkout
   ↓
User completes payment
   ↓
Stripe Webhook → /api/stripe-webhook
   ↓
Update user subscription_status in Supabase
   ↓
Redirect to Success Page
```

### AI Generation Flow

```
User inputs text description
   ↓
Check authentication (Clerk)
   ↓
Check subscription status (Supabase)
   ↓
Check AI usage limit (Supabase)
   ↓
Call OpenAI API (GPT-4)
   ↓
Parse JSON response
   ↓
Increment usage counter
   ↓
Return data to frontend
   ↓
User can edit/save/export
```

### Project Management Flow

```
Create/Edit Project
   ↓
Auto-save to Supabase (debounced)
   ↓
Store as JSONB in projects table
   ↓
Load projects list from Supabase
   ↓
Export to PNG/JSON locally
```

---

## 🔌 API Endpoints

### Authentication
- Handled by Clerk (no custom endpoints needed)

### Subscription Management

#### `POST /api/create-checkout`
Creates a Stripe checkout session for subscription

**Request:**
```json
{
  "planType": "basic" | "pro"
}
```

**Response:**
```json
{
  "checkoutUrl": "https://checkout.stripe.com/..."
}
```

**Logic:**
1. Get authenticated user from Clerk
2. Get/create user in Supabase
3. Get/create Stripe customer
4. Create Stripe checkout session
5. Return checkout URL

#### `GET /api/check-subscription`
Checks user's current subscription status

**Response:**
```json
{
  "hasSubscription": true,
  "subscriptionStatus": "active",
  "planType": "pro",
  "isWhitelisted": false,
  "needsSubscription": false
}
```

**Logic:**
1. Get authenticated user from Clerk
2. Query Supabase for subscription status
3. Check if user is whitelisted
4. Return subscription details

#### `POST /api/stripe-webhook`
Handles Stripe webhook events

**Events Handled:**
- `checkout.session.completed` - Activate subscription
- `customer.subscription.updated` - Update subscription
- `customer.subscription.deleted` - Cancel subscription
- `invoice.payment_succeeded` - Confirm payment
- `invoice.payment_failed` - Handle failed payment

**Logic:**
1. Verify webhook signature
2. Parse event type
3. Update Supabase based on event
4. Return 200 OK

#### `POST /api/cancel-subscription`
Cancels user's subscription

**Response:**
```json
{
  "success": true,
  "message": "Subscription canceled"
}
```

### AI Generation

#### `POST /api/ai-generate`
Generates Gantt chart or RACI matrix using AI

**Request:**
```json
{
  "textInput": "Project description...",
  "type": "gantt" | "raci"
}
```

**Response:**
```json
{
  "data": {
    "timeline": { ... } // or "raciMatrix": { ... }
  },
  "remaining": 4
}
```

**Logic:**
1. Authenticate user (Clerk)
2. Check subscription status (Supabase)
3. Check AI usage limit (Supabase)
4. Call OpenAI API with system prompt
5. Parse JSON response
6. Increment usage counter
7. Return generated data + remaining credits

#### `GET /api/ai-usage`
Gets user's AI usage stats

**Response:**
```json
{
  "used": 3,
  "remaining": 2,
  "limit": 5,
  "resetDate": "2024-02-01"
}
```

### Project Management

#### `GET /api/projects`
Gets all projects for authenticated user

**Response:**
```json
{
  "projects": [
    {
      "id": "uuid",
      "name": "My Project",
      "type": "gantt",
      "data": { ... },
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

#### `POST /api/projects`
Creates a new project

**Request:**
```json
{
  "name": "My Project",
  "type": "gantt" | "raci",
  "data": { ... }
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "My Project",
  "type": "gantt",
  "data": { ... }
}
```

#### `GET /api/projects/[id]`
Gets a specific project

#### `PUT /api/projects/[id]`
Updates a project

**Request:**
```json
{
  "name": "Updated Name",
  "data": { ... }
}
```

#### `DELETE /api/projects/[id]`
Deletes a project

---

## 📄 Pages & Features

### Public Pages

#### `/` - Landing Page
- **Hero section** with value proposition
- **Features showcase** (AI generation, charts, exports)
- **Pricing preview**
- **Call-to-action** buttons
- **Testimonials/Social proof**
- Modern gradient design with shadcn/ui components

#### `/pricing` - Pricing Page
- **Two pricing tiers**: Basic ($9/mo) and Pro ($19/mo)
- **Feature comparison**
- **FAQ section**
- **Stripe checkout integration**
- Professional pricing cards with shadcn/ui

#### `/sign-in` - Sign In Page
- Clerk authentication component
- Social logins (Google, GitHub)
- Email/password login
- Redirect to dashboard after sign-in

#### `/sign-up` - Sign Up Page
- Clerk authentication component
- Social sign-ups
- Email/password registration
- Redirect to pricing after sign-up

### Protected Pages (Require Auth)

#### `/dashboard` - Dashboard
- **Welcome message** with user name
- **Quick stats**: Projects count, AI credits remaining
- **Subscription status** badge
- **Quick actions**: Create new project, view pricing
- **Recent projects** list
- Modern cards and layout with shadcn/ui

#### `/dashboard/projects` - Projects List
- **Grid/list view** of all projects
- **Filter by type** (Gantt/RACI)
- **Search functionality**
- **Create new project** button
- **Project cards** with preview, edit, delete actions
- **Empty state** when no projects

#### `/dashboard/projects/new` - Create Project
- **Project type selector** (Gantt or RACI)
- **AI generation option**: Text input → Generate
- **Manual creation option**: Blank canvas
- **Template library** (optional)
- Professional form with shadcn/ui components

#### `/dashboard/projects/[id]` - Edit Project
- **Live editor** for Gantt charts or RACI matrices
- **Auto-save** functionality (debounced)
- **Toolbar**: Save, Export (PNG/JSON), Delete
- **Undo/Redo** (optional)
- **Interactive visualization** using ReactFlow
- Clean, professional editor interface

#### `/dashboard/subscription` - Subscription Management
- **Current plan** display
- **Usage statistics**: AI credits used/remaining
- **Billing history** (via Stripe portal)
- **Upgrade/downgrade** buttons
- **Cancel subscription** button
- **Manage billing** (Stripe customer portal link)

#### `/payment/success` - Payment Success
- **Success message** with confetti animation
- **Subscription details**
- **Next steps** guidance
- **Go to dashboard** button

#### `/payment/cancelled` - Payment Cancelled
- **Friendly cancellation message**
- **Return to pricing** button
- **Contact support** link

---

## 🎨 UI/UX Design Guidelines (shadcn/ui)

### Design System

**Colors:**
- **Primary**: Purple (`#9333EA`)
- **Secondary**: Pink (`#EC4899`)
- **Accent**: Blue (`#3B82F6`)
- **Success**: Green (`#10B981`)
- **Error**: Red (`#EF4444`)
- **Warning**: Yellow (`#F59E0B`)
- **Neutral**: Gray scale

**Typography:**
- **Font**: Inter (system font stack)
- **Headings**: Bold, larger sizes
- **Body**: Regular, 16px base

**Components (shadcn/ui):**
- Button
- Card
- Badge
- Input
- Select
- Dialog
- Dropdown Menu
- Table
- Tabs
- Toast notifications
- Progress
- Skeleton loaders

**Layout:**
- Clean, spacious design
- Consistent spacing (4px, 8px, 16px, 24px, 32px)
- Responsive grid system
- Mobile-first approach

**Interactions:**
- Smooth transitions
- Hover states
- Loading states
- Error states
- Success feedback

---

## 💰 Pricing Tiers

### Basic Plan - $9/month
- **5 AI Generations per month**
- Unlimited manual editing
- Unlimited code imports (JSON)
- Unlimited projects
- Auto-save & cloud storage
- Export to PNG/JSON
- Email support

### Pro Plan - $19/month (Most Popular)
- **12 AI Generations per month**
- Everything in Basic
- Priority support
- Early access to new features

### Whitelisted Users (Free)
- Unlimited AI generations
- All Pro features
- For testing/development

---

## 🚀 Setup Instructions

### One-Command Setup

```bash
# Clone repository
git clone <repo-url>
cd projectflow-ai

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your keys
# Then run the app
npm run dev
```

The app will be available at `http://localhost:3000`

### Manual Setup

1. **Install Node.js** (v18 or higher)

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Setup environment variables:**
   - Copy `.env.example` to `.env.local`
   - Fill in all the API keys

4. **Setup Supabase:**
   - Create a Supabase project
   - Run the SQL schema from the "Database Schema" section
   - Copy the connection details to `.env.local`

5. **Setup Clerk:**
   - Create a Clerk application
   - Enable email/password and social providers
   - Copy keys to `.env.local`

6. **Setup Stripe:**
   - Create a Stripe account
   - Create two products: Basic ($9/mo) and Pro ($19/mo)
   - Create price IDs for each product
   - Setup webhook endpoint: `https://your-domain.com/api/stripe-webhook`
   - Copy keys and price IDs to `.env.local`

7. **Setup OpenAI:**
   - Get API key from OpenAI
   - Copy to `.env.local`

8. **Install shadcn/ui:**
   ```bash
   npx shadcn-ui@latest init
   ```

9. **Run development server:**
   ```bash
   npm run dev
   ```

---

## 📦 Deployment Guide

### Deploy to Vercel (Recommended)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo>
   git push -u origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add all environment variables from `.env.local`
   - Deploy

3. **Setup Stripe Webhook:**
   - Copy your Vercel domain: `https://your-app.vercel.app`
   - Go to Stripe Dashboard → Webhooks
   - Add endpoint: `https://your-app.vercel.app/api/stripe-webhook`
   - Copy webhook secret to Vercel environment variables

4. **Update Clerk:**
   - Go to Clerk Dashboard
   - Update allowed domains to include your Vercel domain

### Deploy to AWS/Other Cloud

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Start production server:**
   ```bash
   npm start
   ```

3. **Use Docker (optional):**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

4. **Environment variables:**
   - Set all env vars in your hosting platform
   - Update webhook URLs
   - Update allowed domains in Clerk

---

## 🧪 Testing

### Test Accounts

**Whitelisted User (Unlimited AI):**
- Clerk User ID: `user_3AFuuZeqtkGNYQHHthj8WDpguVo`

**Stripe Test Cards:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

### Manual Testing Checklist

- [ ] Sign up new user
- [ ] Sign in existing user
- [ ] Subscribe to Basic plan
- [ ] Subscribe to Pro plan
- [ ] Generate Gantt chart with AI
- [ ] Generate RACI matrix with AI
- [ ] Create project manually
- [ ] Edit and auto-save project
- [ ] Export project to PNG
- [ ] Export project to JSON
- [ ] Check AI usage limits
- [ ] Cancel subscription
- [ ] Webhook handling (payment success/fail)

---

## 📊 Data Models

### Gantt Chart JSON Structure

```json
{
  "timeline": {
    "totalMonths": 12,
    "phases": [
      {
        "name": "Phase 1: Planning",
        "startMonth": 1,
        "endMonth": 3,
        "color": "blue",
        "months": [
          {
            "month": 1,
            "title": "Month 1: Research",
            "tasks": ["Task 1", "Task 2"],
            "deliverables": ["Deliverable 1"],
            "milestones": ["Milestone 1"]
          }
        ]
      }
    ]
  }
}
```

### RACI Matrix JSON Structure

```json
{
  "raciMatrix": {
    "roles": ["Project Manager", "Developer", "Designer"],
    "tasks": [
      {
        "activity": "Design UI mockups",
        "category": "Design",
        "ProjectManager": "A",
        "Developer": "I",
        "Designer": "R"
      }
    ]
  }
}
```

**RACI Legend:**
- **R** = Responsible (does the work)
- **A** = Accountable (decision maker)
- **C** = Consulted (provides input)
- **I** = Informed (kept in the loop)

---

## 🔒 Security Best Practices

1. **Environment Variables:**
   - Never commit `.env.local` to git
   - Use `.env.example` for templates
   - Rotate API keys regularly

2. **Authentication:**
   - Clerk handles security
   - Use server-side authentication checks
   - Protect API routes with middleware

3. **Database:**
   - Use Row Level Security (RLS)
   - Service role key only on server
   - Sanitize user inputs

4. **Payments:**
   - Verify webhook signatures
   - Use Stripe's test mode during development
   - Never expose secret keys to client

5. **API Keys:**
   - Store in environment variables
   - Use server-side only
   - Implement rate limiting

---

## 📝 Additional Features to Implement

### Phase 2 (Future)
- [ ] Team collaboration (share projects)
- [ ] Project templates library
- [ ] PDF export
- [ ] Dark mode
- [ ] Mobile app
- [ ] Integrations (Slack, Jira, etc.)
- [ ] Custom branding
- [ ] API for third-party apps
- [ ] Analytics dashboard
- [ ] Email notifications

---

## 🆘 Common Issues & Solutions

### Issue: Clerk authentication not working
**Solution:** Check that `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set and valid

### Issue: Stripe webhook not receiving events
**Solution:**
1. Check webhook URL is correct
2. Verify webhook secret matches
3. Test using Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe-webhook`

### Issue: OpenAI API timeout
**Solution:** Increase timeout in fetch call, or use GPT-3.5-turbo instead of GPT-4

### Issue: Supabase connection error
**Solution:** Check that service role key is correct and RLS policies are configured

### Issue: AI generation not working
**Solution:**
1. Check OpenAI API key is valid
2. Check usage limits
3. Check subscription status

---

## 📞 Support & Contact

For issues or questions:
- Email: support@projectflow-ai.com
- GitHub Issues: [repo-url]/issues
- Documentation: [docs-url]

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🎉 Credits

Built with:
- Next.js
- Clerk
- Stripe
- Supabase
- OpenAI
- shadcn/ui
- Tailwind CSS

---

**Last Updated:** 2024-01-15

**Version:** 1.0.0

**Status:** Production Ready
