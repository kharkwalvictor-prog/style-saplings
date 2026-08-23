# Style Saplings

Premium Indian children's ethnic wear (ages 2–5) — D2C e-commerce platform.

**Business:** Shivaya Enterprises (Proprietorship)
**Owner:** Victor Arun Kharkwal
**Admin user:** shamvi.sharma@gmail.com
**Production URL:** https://stylesaplings.com

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui + Framer Motion |
| Database / Auth / Storage | Supabase (`igjltsdmlqxziokjeuwa`, ap-southeast-1) |
| Edge Functions | Deno (11 functions in `supabase/functions/`) |
| Hosting | Vercel (project: `style-saplings`, account: `kharkwalvictor-5541`) |
| Payments | Razorpay (LIVE mode) |
| Email | Resend (pending setup — `RESEND_API_KEY` not yet set) |
| Shipping | Shiprocket (LIVE account: shamvi.sharma@gmail.com) |

---

## Local Development

### Prerequisites
- Node.js 20+ or Bun
- A `.env` file (see `.env.example`)

### Setup

```sh
# 1. Clone
git clone https://github.com/kharkwalvictor-prog/style-saplings.git
cd style-saplings

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env — fill in VITE_SUPABASE_* and VITE_RAZORPAY_KEY_ID
# Retrieve values from Supabase Dashboard → Settings → API
# and Razorpay Dashboard → Settings → API Keys

# 4. Start dev server
npm run dev
# → http://localhost:5173
```

### Useful commands

```sh
npm run build      # Production build → dist/
npm run lint       # ESLint check
npm run test       # Run Vitest test suite
npm run preview    # Preview production build locally
```

---

## Deployment

The project is deployed on **Vercel** (not Lovable).

- **Preview:** Every push to `main` triggers an automatic preview deployment on Vercel.
- **Production:** Promote a preview to production in Vercel Dashboard, or run `vercel --prod`.
- **Environment variables:** Set in Vercel Dashboard → Project → Settings → Environment Variables. The four required frontend vars are `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`, and `VITE_RAZORPAY_KEY_ID`.
- **Edge Functions:** Deployed separately to Supabase. Run `supabase functions deploy <name>` after updating `supabase/functions/`. The `project_id` in `supabase/config.toml` is already set to the live project ref.

---

## Project Structure

```
src/
├── pages/              # 19 route pages (App.tsx defines all routes)
├── components/
│   ├── admin/          # Admin panel tabs + ShipOrderDialog
│   └── ui/             # shadcn/ui components
├── hooks/              # useAdmin, useOrders, useProducts, useAdminRealtime, …
├── utils/              # gstUtils.ts (GST engine), invoiceUtils.ts
├── context/            # CartContext (localStorage key: ss_cart)
└── integrations/supabase/client.ts

supabase/
├── config.toml         # Edge function JWT settings + project ref
├── functions/          # 11 Edge Functions (Deno)
│   ├── _shared/        # sendEmail.ts, emailTemplates.ts
│   ├── create-razorpay-order/
│   ├── verify-razorpay-payment/
│   ├── send-order-confirmation/
│   ├── generate-invoice/
│   ├── create-shipment/
│   ├── get-shipping-label/
│   ├── send-shipping-notification/
│   ├── track-shipment/
│   ├── track-order/
│   ├── validate-return-upload/
│   └── sitemap/
└── migrations/         # 15 SQL migration files

docs/
├── TECH_DOCUMENT.md
├── BACKEND_ARCHITECTURE.md
├── ADMIN_PANEL.md
└── SHIPPING_INTEGRATION.md
```

---

## Admin Panel

Access at `/admin` — login with `shamvi.sharma@gmail.com`.

**Tabs:** Dashboard · Orders · Customers · Inventory · Refunds · GST · Marketing · Blog · Content · Settings

**Go Live toggle:** Admin → Settings → "Store is PAUSED/LIVE". When paused, checkout shows a "Coming Soon" page. This is controlled by the `store_live` key in the `site_content` database table.

**To add an admin user:**
1. Create the user in Supabase Dashboard → Authentication → Users
2. Run in Supabase SQL Editor:
```sql
INSERT INTO user_roles (user_id, role) VALUES ('<user-uuid>', 'admin');
```

---

## Edge Function Security

Functions split by access level:

| Function | JWT required | Who calls it |
|---|---|---|
| `create-razorpay-order` | No | Guest checkout |
| `verify-razorpay-payment` | No | Guest checkout |
| `send-order-confirmation` | No | Guest checkout (fire-and-forget) |
| `validate-return-upload` | No | Guest returns form |
| `track-order` | No | Public tracking page |
| `sitemap` | No | Search engine crawlers |
| `track-shipment` | No | Public tracking |
| `create-shipment` | **Yes** | Admin panel (ShipOrderDialog) |
| `get-shipping-label` | **Yes** | Admin panel (ShipOrderDialog) |
| `generate-invoice` | **Yes** | Called server-side with SERVICE_ROLE_KEY |
| `send-shipping-notification` | **Yes** | Admin panel |

---

## Before Going Live

- [ ] Set `RESEND_API_KEY` in Supabase Edge Function secrets
- [ ] Verify `stylesaplings.com` domain with Resend (add DNS TXT/MX records)
- [ ] Add `VITE_RAZORPAY_KEY_ID` to Vercel environment variables
- [ ] Point `stylesaplings.com` DNS: A record → `76.76.21.21`, www CNAME → `cname.vercel-dns.com`
- [ ] Upload real product photos via Admin → Inventory
- [ ] Flip "Go Live" in Admin → Settings

---

## Key Documentation

- [`docs/TECH_DOCUMENT.md`](docs/TECH_DOCUMENT.md) — Full technical reference
- [`docs/BACKEND_ARCHITECTURE.md`](docs/BACKEND_ARCHITECTURE.md) — DB schema, RLS, edge functions, data flows
- [`docs/ADMIN_PANEL.md`](docs/ADMIN_PANEL.md) — Admin panel architecture
- [`docs/SHIPPING_INTEGRATION.md`](docs/SHIPPING_INTEGRATION.md) — Shiprocket integration details
