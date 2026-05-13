# Style Saplings — Technical Documentation

**Version:** 2.0  
**Date:** March 2026  
**Company:** Shivaya Enterprises, New Delhi  
**Prepared for:** Tech Team  

---

## 1. Project Overview

Style Saplings is a D2C e-commerce web application for premium Indian children's ethnic wear (ages 2–5). The platform supports a full shopping experience — product browsing, search, cart, checkout, order placement — plus an admin panel for product, order, customer, and content management.

### Brand Identity
- **Brand Name:** Style Saplings  
- **Tagline:** Authentic Indian Craftsmanship for Little Ones  
- **Target Audience:** Parents of children aged 2–5 years  
- **Product Focus:** Chikankari, Bandhani, Firan, Festive ethnic wear  
- **Contact:** support@stylesaplings.com / +91-9810901031  
- **Grievance Officer:** Victor Kharkwal  

### Business Entity
| Field | Value |
|-------|-------|
| Legal Name | Shivaya Enterprises |
| Trade Name | Style Saplings |
| Address | 6488, C6, Vasant Kunj, New Delhi 110070 |
| State / Code | Delhi / 07 |
| GSTIN | Configure in `gst_config` table |

---

## 2. Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Frontend** | React 18 + TypeScript + Vite | SPA with client-side routing |
| **Styling** | Tailwind CSS + shadcn/ui | HSL design tokens in `index.css` |
| **State** | React Context (Cart), TanStack Query (Server) | Cart persisted to localStorage |
| **Animation** | Framer Motion | Page transitions, micro-interactions |
| **Database** | PostgreSQL 15 (Lovable Cloud) | RLS, triggers, functions |
| **Auth** | Lovable Cloud Auth | Email/password for admin only |
| **Storage** | Lovable Cloud Storage (S3-compatible) | 4 buckets |
| **Edge Functions** | Deno runtime | Razorpay, email, invoicing |
| **Payments** | Razorpay Standard Checkout | Edge function architecture |
| **Email** | Resend API | Order confirmation, shipping, invoices |
| **Hosting** | Lovable Cloud | Auto-deploy on save |

### Key Dependencies
| Package | Purpose |
|---------|---------|
| `@supabase/supabase-js` | Database client |
| `@tanstack/react-query` | Server state management |
| `react-router-dom` | Client-side routing |
| `framer-motion` | Animations |
| `recharts` | Charts in admin |
| `date-fns` | Date formatting |
| `sonner` | Toast notifications |
| `zod` | Schema validation |
| `react-hook-form` | Form handling |
| `lucide-react` | Icons |

---

## 3. Project Structure

```
src/
├── assets/                  # Product & hero images
├── components/
│   ├── layout/
│   │   ├── Header.tsx       # Nav + search + mobile menu
│   │   └── Footer.tsx       # Site footer
│   ├── admin/               # Admin panel components (8 tabs)
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminOrders.tsx
│   │   ├── AdminProducts.tsx
│   │   ├── AdminCustomers.tsx
│   │   ├── AdminRefunds.tsx
│   │   ├── AdminMarketing.tsx
│   │   ├── AdminGSTReport.tsx
│   │   └── AdminBlog.tsx
│   ├── ui/                  # shadcn/ui components
│   ├── ProductCard.tsx      # Reusable product card
│   ├── NavLink.tsx          # Active nav link
│   ├── PageMeta.tsx         # SEO meta tags
│   └── JsonLd.tsx           # Structured data (JSON-LD)
├── context/
│   └── CartContext.tsx       # Cart state (localStorage)
├── data/
│   └── products.ts          # Legacy static fallback data
├── hooks/
│   ├── useAdmin.tsx         # Admin auth context + role check
│   ├── useAdminRealtime.ts  # Realtime subscriptions for admin
│   ├── useOrders.ts         # Orders query + mutations
│   ├── useProducts.ts       # Products query hooks
│   ├── useBlogPosts.ts      # Blog query hooks
│   ├── useProductSearch.ts  # Full-text search hook
│   ├── useSEO.ts            # Dynamic meta tags hook
│   └── use-mobile.tsx       # Mobile breakpoint detection
├── integrations/
│   └── supabase/
│       ├── client.ts        # Auto-generated client
│       └── types.ts         # Auto-generated DB types
├── pages/                   # 18 route pages
├── utils/
│   ├── gstUtils.ts          # GST calculation engine
│   └── invoiceUtils.ts      # Invoice generation & export
├── App.tsx                  # Root + routing
├── main.tsx                 # Entry point
└── index.css                # Design system tokens

supabase/
├── config.toml              # Edge function config
└── functions/
    ├── _shared/
    │   ├── emailTemplates.ts # Reusable email HTML
    │   └── sendEmail.ts      # Resend API wrapper
├── create-razorpay-order/
    ├── verify-razorpay-payment/
    ├── send-order-confirmation/
    ├── send-shipping-notification/
    ├── generate-invoice/
    ├── validate-return-upload/
    ├── sitemap/
    └── track-order/

docs/
├── TECH_DOCUMENT.md          # This file
├── BACKEND_ARCHITECTURE.md   # Detailed backend docs
└── ADMIN_PANEL.md            # Admin panel architecture
```

---

## 4. Database Schema

### 4.1 Enums

| Enum | Values |
|------|--------|
| `app_role` | admin, user |
| `craft_type` | Chikankari, Bandhani, Firan, Festive |
| `order_status` | pending, processing, packed, shipped, delivered, cancelled |
| `payment_method` | razorpay, cod |
| `payment_status` | pending, paid, failed, refunded |
| `stock_status` | in_stock, low_stock, out_of_stock |
| `refund_request_type` | refund, exchange, return |
| `refund_status` | pending, approved, rejected, processed |

### 4.2 Core Tables

| Table | Purpose | RLS |
|-------|---------|-----|
| `products` | Product catalog (18 columns incl search_vector) | Public read, admin write |
| `orders` | Customer orders with GST breakdowns + cancel_reason | Public insert, admin read/update |
| `order_status_history` | Status change audit trail | Admin only |
| `order_notes` | Admin notes on orders | Admin only |
| `user_roles` | Admin role assignments | Admin read only |
| `gst_config` | Business GST configuration | Public read, admin write |
| `invoice_sequence` | Auto-increment invoice numbers | Admin only |
| `invoices` | Generated invoice records | Admin + owner read |
| `refund_requests` | Return/refund/exchange requests | Public insert/read, admin manage |
| `blog_posts` | CMS content | Published=public, admin manage |
| `customer_notes` | Admin CRM notes | Admin only |
| `customer_tags` | Customer segmentation tags | Admin only |
| `discount_codes` | Promo codes | Public read, admin manage |
| `product_reviews` | Customer reviews (moderated) | Approved=public, admin manage |
| `wishlists` | Session-based wishlists | Public CRUD |
| `back_in_stock_requests` | Restock notifications | Public insert, admin manage |
| `restock_history` | Stock change audit | Admin only |
| `email_log` | Email delivery tracking | Admin read |
| `cod_otp` | COD verification codes | Public insert |
| `order_rate_limits` | Order spam prevention | Public insert, admin read |

### 4.3 Database Functions

| Function | Type | Purpose |
|----------|------|---------|
| `has_role(uuid, app_role)` | SECURITY DEFINER | Role check without RLS recursion |
| `get_next_invoice_number(text)` | SECURITY DEFINER | Auto-increment invoice # per month |
| `update_updated_at_column()` | Trigger | Auto-update `updated_at` columns |
| `products_search_vector_update()` | Trigger | Maintain full-text search index |
| `validate_review_rating()` | Trigger | Enforce 1-5 rating range |
| `validate_email_log_status()` | Trigger | Enforce status values |
| `validate_discount_type()` | Trigger | Enforce discount type values |

### 4.4 Storage Buckets

| Bucket | Public | Purpose |
|--------|--------|---------|
| `product-images` | Yes | Product photography uploads |
| `blog-images` | Yes | Blog cover images |
| `return-images` | Yes | Customer return evidence photos |
| `invoices` | No | Generated invoice PDFs |

---

## 5. Authentication & Authorization

- **Admin Login:** Email/password via Lovable Cloud Auth
- **Role Check:** `has_role(uid, 'admin')` RPC (SECURITY DEFINER)
- **No customer auth:** Checkout is guest-only
- **Email normalization:** `trim().toLowerCase()` before auth
- **Safety timeout:** 5-second max on role verification
- **Password reset:** Via magic link → `/reset-password` route

### Setting Up First Admin
1. Create user in Lovable Cloud → Users
2. Insert role: `INSERT INTO user_roles (user_id, role) VALUES ('<uuid>', 'admin');`

---

## 6. Frontend Architecture

### 6.1 Routing

| Route | Page | Auth |
|-------|------|------|
| `/` | Homepage | No |
| `/shop` | Collection with filters & search | No |
| `/product/:slug` | Product detail | No |
| `/cart` | Shopping cart | No |
| `/checkout` | Checkout with GST | No |
| `/order-confirmation` | Thank you page | No |
| `/track` `/track/:order_number` | Order tracking | No |
| `/admin` | Admin panel (8 tabs) | Yes (admin) |
| `/reset-password` | Password reset | No |
| `/sitemap.xml` | Redirect to dynamic sitemap edge function | No |
| `/about` | Brand story | No |
| `/blog` | Blog listing | No |
| `/blog/:slug` | Blog post | No |
| `/contact` | Contact info | No |
| `/returns` | Return request form | No |
| `/refund-policy` `/shipping-policy` `/privacy-policy` `/terms-of-service` | Legal pages | No |

### 6.2 State Management

| Type | Technology | Storage |
|------|-----------|---------|
| Cart | React Context | localStorage (`ss_cart`) |
| Server Data | TanStack Query | In-memory cache |
| Admin Auth | React Context | Supabase session |
| Products | 5-min staleTime | Reduces refetches |

### 6.3 Design System

All colors use HSL in `index.css`. No hardcoded colors in components.

| Token | Role | Value |
|-------|------|-------|
| `--background` | Page background | Warm cream (#FAF7F2) |
| `--foreground` | Text color | Dark brown |
| `--primary` | CTA / brand | Terracotta (#C4622D) |
| `--secondary` | Secondary accent | Sage green (#4A6741) |

**Typography:** Headings = Cormorant Garamond (serif), Body = Inter (sans-serif)

### 6.4 Product Search

- **Backend:** `search_vector` tsvector column with GIN index
- **Trigger:** Auto-updates on product INSERT/UPDATE
- **Frontend:** `useProductSearch` hook with 300ms debounce, 2-char minimum
- **UI:** Expandable search in nav, dropdown results (max 5), full results on Shop page via `?search=` param

### 6.5 SEO Infrastructure

| Feature | Implementation |
|---------|---------------|
| Dynamic meta tags | `useSEO` hook on every page |
| Open Graph | og:title, og:description, og:image per page |
| Twitter Cards | twitter:card, twitter:title, twitter:description |
| Canonical URLs | Set per page |
| JSON-LD | Organization (all pages) + Product schema (product pages) |
| Sitemap | Dynamic via `sitemap` edge function (auto-includes products + blog posts) |
| Sitemap Route | `/sitemap.xml` → redirects to edge function |
| Robots.txt | Blocks /admin, /admin/*, /reset-password |

---

## 7. Payment & Checkout

### Razorpay (Online Payment)
```
Client → create-razorpay-order (edge fn) → Razorpay API
       → Razorpay Checkout.js modal
       → verify-razorpay-payment (edge fn, HMAC-SHA256)
       → Order created with payment_status: 'paid'
```

### COD (Cash on Delivery)
```
Client → Rate limit check → Order created with payment_status: 'pending'
```

### Discount Codes
- Types: percentage, fixed, shipping
- Validated client-side against `discount_codes` table
- Usage count incremented on order placement

### Shipping
- Free above ₹999
- ₹99 flat rate below ₹999

---

## 8. GST Compliance

**Source:** `src/utils/gstUtils.ts`

- All prices are **inclusive of GST**
- Rate: 5% (price < ₹1,000) or 12% (price ≥ ₹1,000)
- HSN Code: `62099090` (children's garments)
- Intra-state (Delhi): CGST + SGST split 50/50
- Inter-state: IGST at full rate
- GSTIN validation: 15-char regex
- B2B invoicing with company name and GSTIN

---

## 9. Edge Functions

| Function | JWT | Purpose | Secrets |
|----------|-----|---------|---------|
| `create-razorpay-order` | No | Create Razorpay order | RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET |
| `verify-razorpay-payment` | No | HMAC signature verification | RAZORPAY_KEY_SECRET |
| `send-order-confirmation` | No | Customer + admin email + invoice | RESEND_API_KEY, SUPABASE_SERVICE_ROLE_KEY |
| `send-shipping-notification` | No | Shipping update email | RESEND_API_KEY, SUPABASE_SERVICE_ROLE_KEY |
| `generate-invoice` | No | PDF invoice generation + storage | SUPABASE_SERVICE_ROLE_KEY |
| `validate-return-upload` | No | Return image validation | SUPABASE_SERVICE_ROLE_KEY |
| `sitemap` | No | Dynamic XML sitemap (products + blog) | None (uses anon key) |

### Email System
- **Provider:** Resend API
- **Templates:** Shared in `supabase/functions/_shared/emailTemplates.ts`
- **Emails sent:**
  - Order confirmation (customer)
  - New order alert (admin: support@stylesaplings.com)
  - Tax invoice (customer, with signed URL)
  - Shipping notification (customer, with tracking)
- **Logging:** All emails logged in `email_log` table with status

---

## 10. Secrets & Environment

### Auto-configured (.env — never edit)
| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | API endpoint |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Anon key |
| `VITE_SUPABASE_PROJECT_ID` | Project ID |

### Cloud Secrets (Edge Functions only)
| Secret | Purpose |
|--------|---------|
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side admin access |
| `RAZORPAY_KEY_ID` | Razorpay API auth |
| `RAZORPAY_KEY_SECRET` | Razorpay HMAC signing |
| `VITE_RAZORPAY_KEY_ID` | Client-side Checkout.js |
| `RESEND_API_KEY` | Email delivery |
| `LOVABLE_API_KEY` | Lovable platform |

**⚠️ Private keys NEVER in client code — only accessible from edge functions.**

---

## 11. Realtime

**Source:** `src/hooks/useAdminRealtime.ts`

Subscribes to PostgreSQL changes via single channel `admin-realtime`:
- `orders` → invalidates `admin-orders` query
- `refund_requests` → invalidates `admin-refunds` query
- `products` → invalidates `products` query

Connection status displayed as green/red indicator in admin header.

---

## 12. Pending Integrations

| Feature | Status | Notes |
|---------|--------|-------|
| COD OTP (Twilio) | Planned | Phone verification before COD orders |
| Shiprocket | Not started | Order push + tracking webhooks |
| WhatsApp API | Manual only | Admin has copy-to-clipboard templates |
| Customer accounts | Not planned | Currently guest checkout only |
| ~~Dynamic sitemap~~ | ✅ Done | Edge function generates XML with products + blog posts |
| Wishlist UI | DB ready | `wishlists` table exists, UI not built |
| Product reviews UI | DB ready | `product_reviews` table exists, UI not built |

---

## 13. Security Checklist

| ✅ | Control |
|----|---------|
| ✅ | RLS enabled on ALL tables |
| ✅ | Admin role via SECURITY DEFINER function |
| ✅ | No client-side role storage |
| ✅ | Private keys only in edge functions |
| ✅ | Razorpay HMAC-SHA256 signature verification |
| ✅ | GSTIN regex validation |
| ✅ | Email normalization on auth |
| ✅ | Order rate limiting (3/hour per phone) |
| ✅ | Orders: public INSERT, no DELETE |
| ✅ | User roles: no public write |
| ⬜ | COD OTP verification |
| ⬜ | CAPTCHA on checkout |

---

## 14. Deployment

- **Frontend:** Auto-deployed via Lovable on every save
- **Edge Functions:** Auto-deployed on save
- **Database Migrations:** Applied through Lovable Cloud migration tool
- **Published URL:** https://sapling-boutique-shop.lovable.app

---

## Related Documentation

- **[BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md)** — Detailed backend schema, RLS policies, edge functions, data flows
- **[ADMIN_PANEL.md](./ADMIN_PANEL.md)** — Complete admin panel architecture, all 8 tabs, workflows

---

*Document prepared by the Style Saplings tech team.*  
*For questions, contact support@stylesaplings.com*  
*Last updated: March 2026*
