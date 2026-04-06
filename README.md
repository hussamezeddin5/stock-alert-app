# AlertTrader — Stock & Crypto Price Alerts

A full-stack web app that lets users set custom price alerts for stocks and cryptocurrencies. When a target is hit, users receive an email notification.

## Tech Stack

- **Frontend/Backend**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Database & Auth**: Supabase
- **Payments**: Stripe (monthly subscription)
- **Email**: Resend
- **Deployment**: Vercel

---

## Getting Started

### 1. Clone and Install

```bash
git clone <your-repo>
cd stock-alert-app
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.local.example .env.local
```

Fill in all values in `.env.local` (see setup sections below).

### 3. Run the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project.

2. Copy your project URL and anon key from **Settings → API** into `.env.local`.

3. Also copy the **service role key** (keep this secret — server-side only).

4. Run the following SQL in the **SQL Editor** to create the required tables:

```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  subscribed BOOLEAN NOT NULL DEFAULT FALSE,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can only read/update their own row
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Alerts table
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('crypto', 'stock')),
  alert_type TEXT NOT NULL CHECK (alert_type IN ('price_drop_percent', 'price_rise_percent', 'price_below', 'price_above')),
  target_value NUMERIC NOT NULL,
  triggered BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Users can only access their own alerts
CREATE POLICY "Users can view own alerts"
  ON public.alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own alerts"
  ON public.alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own alerts"
  ON public.alerts FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

5. In **Authentication → URL Configuration**, set your Site URL to `http://localhost:3000` (dev) or your Vercel URL (prod).

6. Add `http://localhost:3000/api/auth/callback` to the **Redirect URLs** list.

---

## Stripe Setup

1. Go to [stripe.com](https://stripe.com) and create an account (or use an existing one).

2. Copy your **Publishable key** and **Secret key** from the dashboard into `.env.local`.

3. **Create a Product and Price**:
   - Go to **Products → Add Product**
   - Name: "AlertTrader Pro"
   - Add a price: **$15.00 / month** (recurring)
   - Copy the **Price ID** (starts with `price_`) into `STRIPE_PRICE_ID`

4. **Set up Webhooks** (for subscription events):
   - Go to **Developers → Webhooks → Add endpoint**
   - Endpoint URL: `https://your-vercel-url.vercel.app/api/stripe/webhook`
   - For local development, use the [Stripe CLI](https://stripe.com/docs/stripe-cli):
     ```bash
     stripe listen --forward-to localhost:3000/api/stripe/webhook
     ```
   - Select these events to listen for:
     - `checkout.session.completed`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
     - `customer.subscription.deleted`
     - `customer.subscription.updated`
   - Copy the **Webhook Signing Secret** (starts with `whsec_`) into `STRIPE_WEBHOOK_SECRET`

---

## Resend Setup

1. Go to [resend.com](https://resend.com) and create an account.
2. Create an API key and add it to `RESEND_API_KEY`.
3. Add and verify your sending domain, then update the `from` address in `src/lib/resend.ts`:
   ```ts
   from: 'alerts@yourdomain.com',
   ```
   
   > For testing, Resend allows sending from `onboarding@resend.dev` without domain verification.

---

## Alpha Vantage Setup

1. Get a free API key at [alphavantage.co](https://www.alphavantage.co/support/#api-key).
2. Add it to `ALPHA_VANTAGE_API_KEY`.

> **Note**: The free tier allows 25 requests/day and 5/minute. The alert checker processes one stock symbol per request with a 200ms delay. If you have many users with stock alerts, consider upgrading or caching aggressively.

---

## Deploying to Vercel

1. Push your code to GitHub.

2. Go to [vercel.com](https://vercel.com), create a new project, and import your repo.

3. Add all environment variables from `.env.local` in the **Environment Variables** section.

4. Set `NEXT_PUBLIC_APP_URL` to your Vercel deployment URL (e.g., `https://your-app.vercel.app`).

5. Deploy. Vercel will automatically:
   - Run `npm run build`
   - Set up the cron job from `vercel.json` (runs `/api/check-alerts` every 15 minutes)

6. After deploying, update your Stripe webhook URL to the production Vercel URL.

7. Update the Supabase redirect URL in **Authentication → URL Configuration**.

---

## Cron Job (Alert Checker)

The `vercel.json` file configures Vercel Cron to call `/api/check-alerts` every 15 minutes.

To secure this endpoint in production, add a `CRON_SECRET` environment variable and Vercel will automatically send it as `Authorization: Bearer <secret>` in the cron request header.

For local testing, you can call it manually:
```bash
curl http://localhost:3000/api/check-alerts
```

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── auth/page.tsx         # Login / Sign up
│   ├── dashboard/
│   │   ├── page.tsx          # Server component (data fetching)
│   │   └── DashboardClient.tsx # Client component (interactivity)
│   ├── pricing/page.tsx      # Pricing + Stripe checkout
│   ├── success/page.tsx      # Post-payment success
│   └── api/
│       ├── auth/callback/    # Supabase OAuth callback
│       ├── stripe/
│       │   ├── checkout/     # Create Stripe session
│       │   └── webhook/      # Handle Stripe events
│       ├── alerts/           # CRUD for alerts
│       ├── prices/           # Live price data
│       └── check-alerts/     # Background price checker (cron)
├── components/
│   ├── Navbar.tsx
│   ├── LiveTicker.tsx
│   ├── AlertForm.tsx
│   └── AlertList.tsx
├── lib/
│   ├── supabase-client.ts    # Browser Supabase client
│   ├── supabase-server.ts    # Server Supabase client
│   ├── stripe.ts
│   └── resend.ts
└── types/index.ts
```
