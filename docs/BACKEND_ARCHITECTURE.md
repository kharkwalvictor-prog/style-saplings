# Style Saplings — Backend Architecture & Integration Guide

**Version:** 2.0  
**Date:** March 2026  
**Company:** Shivaya Enterprises, New Delhi  
**Prepared for:** Tech Team Review  

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Infrastructure & Stack](#2-infrastructure--stack)
3. [Database Schema](#3-database-schema)
4. [Row Level Security (RLS)](#4-row-level-security-rls)
5. [Authentication & Authorization](#5-authentication--authorization)
6. [Edge Functions](#6-edge-functions)
7. [GST Compliance Engine](#7-gst-compliance-engine)
8. [Payment Integration (Razorpay)](#8-payment-integration-razorpay)
9. [Order Lifecycle](#9-order-lifecycle)
10. [Invoicing System](#10-invoicing-system)
11. [Realtime Subscriptions](#11-realtime-subscriptions)
12. [Storage Buckets](#12-storage-buckets)
13. [Frontend State Management](#13-frontend-state-management)
14. [API Data Flows](#14-api-data-flows)
15. [Admin Panel Architecture](#15-admin-panel-architecture)
16. [Returns & Refund System](#16-returns--refund-system)
17. [Blog / CMS](#17-blog--cms)
18. [Legal Pages](#18-legal-pages)
19. [Secrets & Environment Variables](#19-secrets--environment-variables)
20. [Pending Integrations](#20-pending-integrations)
21. [Security Checklist](#21-security-checklist)
22. [Routing Map](#22-routing-map)

---

## 1. System Overview

Style Saplings is a D2C e-commerce platform for premium Indian children's ethnic wear (ages 2–5). The system is built as a single-page React app with a PostgreSQL backend (Lovable Cloud / Supabase), supporting:

- Guest checkout (no customer auth required)
- Admin-only authentication via email/password
- GST-compliant invoicing (B2B and B2C)
- Razorpay + COD payment methods
- Real-time admin dashboard with order/inventory management
- Blog CMS, returns portal, and legal compliance pages

**Business Entity:**
| Field | Value |
|-------|-------|
| Legal Name | Shivaya Enterprises |
| Trade Name | Style Saplings |
| Address | 6488, C6, Vasant Kunj, New Delhi 110070 |
| State | Delhi (Code: 07) |
| GSTIN | *Configure in `gst_config` table* |
| Contact | support@stylesaplings.com / +91-9810901031 |
| Grievance Officer | Victor Kharkwal |

---

## 2. Infrastructure & Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | React 18 + TypeScript + Vite | SPA with client-side routing |
| Styling | Tailwind CSS + shadcn/ui | HSL design tokens in `index.css` |
| State | React Context (Cart), TanStack Query (Server) | Cart persisted to localStorage |
| Animation | Framer Motion | Page transitions, micro-interactions |
| Database | PostgreSQL 15 (Lovable Cloud) | With RLS, triggers, functions |
| Auth | Lovable Cloud Auth (Supabase Auth) | Email/password for admin only |
| Storage | Lovable Cloud Storage (S3-compatible) | Product images, return photos |
| Edge Functions | Deno runtime (Supabase Edge Functions) | Razorpay order/verify |
| Payments | Razorpay Standard Checkout | Edge function architecture |
| Hosting | Lovable Cloud | Auto-deploy on save |

---

## 3. Database Schema

### 3.1 Enums

```sql
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.craft_type AS ENUM ('Chikankari', 'Bandhani', 'Firan', 'Festive');
CREATE TYPE public.order_status AS ENUM ('pending', 'processing', 'packed', 'shipped', 'delivered', 'cancelled');
CREATE TYPE public.payment_method AS ENUM ('razorpay', 'cod');
CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE public.stock_status AS ENUM ('in_stock', 'low_stock', 'out_of_stock');
CREATE TYPE public.refund_request_type AS ENUM ('refund', 'exchange', 'return');
CREATE TYPE public.refund_status AS ENUM ('pending', 'approved', 'rejected', 'processed');
```

### 3.2 Tables

#### `products`
| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | UUID PK | `gen_random_uuid()` | |
| name | TEXT NOT NULL | | |
| slug | TEXT UNIQUE NOT NULL | | URL identifier |
| description | TEXT | | |
| price | NUMERIC NOT NULL | | MRP inclusive of GST |
| sale_price | NUMERIC | | Optional discount price |
| craft_type | craft_type NOT NULL | | Enum |
| sizes | TEXT[] | `'{}'` | e.g. `["2Y","3Y","4Y","5Y"]` |
| images | TEXT[] | `'{}'` | Public URLs from storage |
| stock_status | stock_status | `'in_stock'` | |
| stock_count | INTEGER | `0` | Actual inventory count |
| low_stock_threshold | INTEGER | `5` | Alert threshold |
| is_featured | BOOLEAN | `false` | Homepage featured toggle |
| category | TEXT | | e.g. "Sets", "Tunics" |
| hsn_code | TEXT | `'62099090'` | HSN for GST (children's garments) |
| supplier_notes | TEXT | | Internal notes |
| created_at | TIMESTAMPTZ | `now()` | |
| updated_at | TIMESTAMPTZ | `now()` | Auto-updated via trigger |

#### `orders`
| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | UUID PK | `gen_random_uuid()` | |
| order_number | TEXT UNIQUE NOT NULL | | Format: `SS-XXXXXX` |
| customer_name | TEXT NOT NULL | | |
| customer_phone | TEXT NOT NULL | | |
| customer_email | TEXT NOT NULL | | |
| customer_gstin | TEXT | | B2B only, validated 15-char |
| customer_company_name | TEXT | | B2B only |
| shipping_address | JSONB | `'{}'` | `{address, city, state, pincode}` |
| items | JSONB | `'[]'` | Array of line items with GST data |
| total_amount | NUMERIC NOT NULL | | Grand total inclusive of GST |
| payment_method | payment_method | `'cod'` | |
| payment_status | payment_status | `'pending'` | |
| order_status | order_status | `'pending'` | |
| razorpay_order_id | TEXT | | Razorpay order reference |
| tracking_number | TEXT | | Shipping tracking ID |
| cancel_reason | TEXT | | Reason for cancellation (mandatory on cancel) |
| supply_type | TEXT | | `'intra'` or `'inter'` |
| gst_breakdowns | JSONB | | Per-item GST calculation snapshot |
| created_at | TIMESTAMPTZ | `now()` | |
| updated_at | TIMESTAMPTZ | `now()` | |

#### `order_status_history`
| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | UUID PK | `gen_random_uuid()` | |
| order_id | UUID FK → orders | | |
| from_status | TEXT | | Previous status |
| to_status | TEXT NOT NULL | | New status |
| changed_by | TEXT | `'admin'` | |
| created_at | TIMESTAMPTZ | `now()` | |

#### `order_notes`
| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | UUID PK | `gen_random_uuid()` | |
| order_id | UUID FK → orders | | |
| note | TEXT NOT NULL | | Admin notes on order |
| created_at | TIMESTAMPTZ | `now()` | |
| updated_at | TIMESTAMPTZ | `now()` | |

#### `user_roles`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | `gen_random_uuid()` |
| user_id | UUID FK → auth.users | ON DELETE CASCADE |
| role | app_role | UNIQUE(user_id, role) |

#### `gst_config` (single row)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | `gen_random_uuid()` |
| gstin | TEXT NOT NULL | Business GSTIN |
| legal_name | TEXT NOT NULL | "Shivaya Enterprises" |
| trade_name | TEXT NOT NULL | "Style Saplings" |
| address | TEXT NOT NULL | Full address |
| state | TEXT NOT NULL | "Delhi" |
| state_code | TEXT NOT NULL | "07" |
| effective_from | DATE | `CURRENT_DATE` |
| created_at / updated_at | TIMESTAMPTZ | |

#### `invoice_sequence`
| Column | Type | Notes |
|--------|------|-------|
| year_month | TEXT PK | e.g. `'202603'` |
| last_number | INTEGER | Default `0`, auto-incremented |

#### `refund_requests`
| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | UUID PK | `gen_random_uuid()` | |
| order_number | TEXT NOT NULL | | Customer-provided |
| order_id | UUID FK → orders | | Linked after validation |
| request_type | refund_request_type | `'refund'` | refund/exchange/return |
| status | refund_status | `'pending'` | |
| reason | TEXT NOT NULL | | |
| description | TEXT | | Detailed explanation |
| customer_name | TEXT NOT NULL | | |
| customer_email | TEXT NOT NULL | | |
| customer_phone | TEXT NOT NULL | | |
| images | TEXT[] | `'{}'` | Uploaded evidence photos |
| refund_amount | NUMERIC | | Admin-set amount |
| admin_notes | TEXT | | |
| replacement_order_id | UUID FK → orders | | For exchanges |
| requested_at | TIMESTAMPTZ | `now()` | |
| resolved_at | TIMESTAMPTZ | | |
| created_at / updated_at | TIMESTAMPTZ | | |

#### `blog_posts`
| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | UUID PK | `gen_random_uuid()` | |
| title | TEXT NOT NULL | | |
| slug | TEXT UNIQUE NOT NULL | | URL identifier |
| excerpt | TEXT | | Short preview |
| content | TEXT | | Full HTML/markdown |
| category | TEXT | | |
| cover_image | TEXT | | URL to blog-images bucket |
| published | BOOLEAN | `false` | |
| published_at | TIMESTAMPTZ | | |
| created_at / updated_at | TIMESTAMPTZ | | |

#### `customer_notes`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| customer_email | TEXT NOT NULL | Key for customer lookup |
| note | TEXT NOT NULL | Admin note |
| created_at | TIMESTAMPTZ | |

#### `customer_tags`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| customer_email | TEXT NOT NULL | |
| tag | TEXT NOT NULL | e.g. "VIP", "Repeat Buyer" |
| is_auto | BOOLEAN | `false` — auto-tagged by system |
| created_at | TIMESTAMPTZ | |

### 3.3 Database Functions

```sql
-- Role check (SECURITY DEFINER to avoid RLS recursion)
has_role(_user_id UUID, _role app_role) → BOOLEAN

-- Auto-increment invoice numbers per month
get_next_invoice_number(p_year_month TEXT) → INTEGER
-- Uses UPSERT on invoice_sequence table
-- Returns next sequential number for given YYYYMM

-- Trigger function for updated_at columns
update_updated_at_column() → TRIGGER
```

---

## 4. Row Level Security (RLS)

All tables have RLS enabled. Policy summary:

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| products | Public | Admin | Admin | Admin |
| orders | Admin | Public (guest checkout) | Admin | ❌ Blocked |
| user_roles | Admin | ❌ Blocked | ❌ Blocked | ❌ Blocked |
| gst_config | Public (read) | Admin | Admin | Admin |
| invoice_sequence | Public (read) | Admin | Admin | Admin |
| order_status_history | Admin | Admin | Admin | Admin |
| order_notes | Admin | Admin | Admin | Admin |
| blog_posts | Published=true (public) OR Admin (all) | Admin | Admin | Admin |
| refund_requests | Public (read + insert) | Public | Admin | Admin |
| customer_notes | Admin | Admin | Admin | Admin |
| customer_tags | Admin | Admin | Admin | Admin |

**Key Security Function:**
```sql
has_role(_user_id UUID, _role app_role) → BOOLEAN
-- SECURITY DEFINER: runs with owner privileges
-- Prevents RLS recursion when checking roles
-- Called in every admin-gated policy
```

---

## 5. Authentication & Authorization

### Flow
1. Admin navigates to `/admin`
2. If no session → shows login form (`AdminLogin.tsx`)
3. Email/password submitted → `supabase.auth.signInWithPassword()`
4. On auth success → `has_role(uid, 'admin')` RPC called
5. If role confirmed → admin dashboard renders
6. 5-second safety timeout prevents infinite loading

### Key Details
- **Email normalization:** `trim().toLowerCase()` before auth
- **No customer auth:** Checkout is fully guest-based
- **Password reset:** Via Supabase Auth magic link → `/reset-password` route
- **Session persistence:** `localStorage` with auto-refresh tokens

### Setting Up First Admin
1. Create user in Lovable Cloud → Users section
2. Insert role:
```sql
INSERT INTO user_roles (user_id, role) VALUES ('<uuid>', 'admin');
```

---

## 6. Edge Functions

All edge functions are in `supabase/functions/` and auto-deploy on save.

### `create-razorpay-order`
- **Path:** `supabase/functions/create-razorpay-order/index.ts`
- **JWT:** `verify_jwt = false` (called from guest checkout)
- **Input:** `{ amount, currency, receipt }`
- **Process:** Calls Razorpay Orders API with Basic Auth
- **Output:** `{ razorpay_order_id }`
- **Secrets Used:** `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`

### `verify-razorpay-payment`
- **Path:** `supabase/functions/verify-razorpay-payment/index.ts`
- **JWT:** `verify_jwt = false`
- **Input:** `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }`
- **Process:** HMAC-SHA256 signature verification: `sign(order_id|payment_id, secret)`
- **Output:** `{ verified: boolean }`
- **Secrets Used:** `RAZORPAY_KEY_SECRET`

### CORS Configuration
Both functions include permissive CORS headers for cross-origin browser requests:
```javascript
{
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, ..."
}
```

### `sitemap`
- **Path:** `supabase/functions/sitemap/index.ts`
- **JWT:** `verify_jwt = false`
- **Process:** Fetches all products + published blog posts, generates XML sitemap with static pages
- **Output:** XML with `Content-Type: application/xml`, `Cache-Control: public, max-age=3600`
- **Static pages included:** `/`, `/shop`, `/about`, `/blog`, `/contact`, `/track`
- **Dynamic pages:** `/product/{slug}` (from products), `/blog/{slug}` (from published blog_posts)
- **Route:** `/sitemap.xml` in React app redirects to edge function URL

### Config (`supabase/config.toml`)
```toml
project_id = "azlcypjesjomiydfyoho"

[functions.create-razorpay-order]
verify_jwt = false

[functions.verify-razorpay-payment]
verify_jwt = false

[functions.sitemap]
verify_jwt = false
```

---

## 7. GST Compliance Engine

### Source: `src/utils/gstUtils.ts`

### Rate Determination
- Price < ₹1,000 → **5% GST**
- Price ≥ ₹1,000 → **12% GST**
- HSN Code: `62099090` (children's garments, cotton, not knitted)
- **All prices on site are INCLUSIVE of GST**

### Core Calculation
```typescript
calculateGST(inclusivePrice, customerState, hsnCode?) → GSTResult
```

**Output shape:**
```typescript
{
  inclusivePrice: 1099,      // What customer pays
  gstRate: 12,               // Determined by price threshold
  gstAmount: 117.75,         // Total GST component
  basePrice: 981.25,         // Price excluding GST
  supplyType: 'inter',       // 'intra' if Delhi, else 'inter'
  cgst: 0,                   // Half of GST (intra-state only)
  sgst: 0,                   // Half of GST (intra-state only)
  igst: 117.75,              // Full GST (inter-state only)
  hsnCode: '62099090'
}
```

### Supply Type Logic
| Customer State | Supply Type | Tax Split |
|---------------|-------------|-----------|
| Delhi | Intra-state | CGST + SGST (50/50) |
| Any other state | Inter-state | IGST (100%) |

### Cart-Level Aggregation
```typescript
calculateCartGST(items[], customerState, shipping) → CartGSTSummary
```
Groups items by GST rate, aggregates taxable values and tax components.

### Additional Utilities
- `validateGSTIN(gstin)` — Regex: `/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/`
- `numberToWords(amount)` — Indian numbering (Lakh, Crore) for invoice "Amount in Words"
- `STATE_CODES` — All 36 Indian states/UTs with 2-digit codes
- `INDIAN_STATES` — Complete list for dropdown selection

---

## 8. Payment Integration (Razorpay)

### Architecture
```
Client (Checkout.tsx)
  │
  ├─► Edge Function: create-razorpay-order
  │     └─► Razorpay API: POST /v1/orders
  │         └─► Returns razorpay_order_id
  │
  ├─► Razorpay Checkout.js (client-side modal)
  │     └─► Customer completes payment
  │         └─► Returns { razorpay_order_id, razorpay_payment_id, razorpay_signature }
  │
  └─► Edge Function: verify-razorpay-payment
        └─► HMAC-SHA256 verification
            └─► Returns { verified: true/false }
```

### Secrets (configured in Lovable Cloud)
| Secret | Purpose |
|--------|---------|
| `RAZORPAY_KEY_ID` | Server-side API auth |
| `RAZORPAY_KEY_SECRET` | Server-side API auth + HMAC signing |
| `VITE_RAZORPAY_KEY_ID` | Client-side Checkout.js initialization |

### Payment Flow
1. Customer fills checkout form, selects "Pay Online"
2. Client calls `create-razorpay-order` edge function with amount in paise
3. Edge function creates order via Razorpay API, returns `razorpay_order_id`
4. Client opens Razorpay Checkout.js modal
5. On success, client calls `verify-razorpay-payment` with signature
6. If verified, order is created in DB with `payment_status: 'paid'`
7. If verification fails, order is NOT created

### COD Flow
1. Customer selects "Cash on Delivery"
2. Order created directly with `payment_status: 'pending'`, `payment_method: 'cod'`
3. *(Planned: OTP verification via Twilio before order creation)*

---

## 9. Order Lifecycle

### Status Flow
```
pending → processing → packed → shipped → delivered
                                              ↓
                                          cancelled (from any state)
```

### Order Number Format
`SS-XXXXXX` — 6 random alphanumeric characters, uppercase

### Order Creation Data
```typescript
{
  order_number: "SS-M1A2B3",
  customer_name, customer_phone, customer_email,
  customer_gstin?,          // B2B only
  customer_company_name?,   // B2B only
  shipping_address: { address, city, state, pincode },
  items: [{ product_id, name, size, quantity, price, hsn_code?, gst_rate? }],
  total_amount: 2198,
  payment_method: "razorpay" | "cod",
  payment_status: "paid" | "pending",
  supply_type: "intra" | "inter",
  gst_breakdowns: { /* per-item GST snapshot */ },
  razorpay_order_id?: "order_xxx"
}
```

### Admin Order Actions
| Action | Trigger | Side Effect |
|--------|---------|-------------|
| Advance to Processing | One-click button | Status history logged |
| Advance to Packed | One-click button | Status history logged |
| Advance to Shipped | Button → tracking number dialog | Tracking saved + status history |
| Mark Delivered | One-click button | Status history logged |
| Cancel | Button → reason dialog | cancel_reason saved + status history logged |
| Print Invoice | Button | Opens print-ready HTML invoice |
| Export CSV | Button | Downloads filtered orders as CSV |

---

## 10. Invoicing System

### Source: `src/utils/invoiceUtils.ts`

### Invoice Number Format
`INV-YYYYMM-NNNN` — e.g. `INV-202603-0042`

### Generation
- Uses `get_next_invoice_number(p_year_month)` PG function
- Auto-increments per month, resets each new month
- Thread-safe via PostgreSQL `INSERT ... ON CONFLICT DO UPDATE`

### Invoice Contents
1. **Header:** "TAX INVOICE", invoice number, date, order number
2. **Seller Details:** Shivaya Enterprises, full address, GSTIN, state code
3. **Bill To / Ship To:** Customer details, GSTIN if B2B
4. **Items Table:** Sr#, Description (name + size), HSN, Qty, Unit Price (excl GST), GST%, GST Amount, Total (incl GST)
5. **Tax Summary:** Grouped by rate — CGST/SGST (intra) or IGST (inter)
6. **Totals:** Subtotal excl GST, tax totals, shipping, grand total
7. **Amount in Words:** Indian numbering format
8. **Payment Details:** Method, status, Razorpay transaction ID if applicable
9. **Footer:** Computer-generated notice, returns policy reference

### B2B vs B2C
| Feature | B2C Invoice | B2B Invoice |
|---------|-------------|-------------|
| Customer GSTIN | Not shown | Prominently displayed |
| Company Name | Not shown | Shown in Bill To |
| Tax Detail | Same | Same |
| Legal requirement | Receipt | Tax Invoice (for ITC claims) |

---

## 11. Realtime Subscriptions

### Source: `src/hooks/useAdminRealtime.ts`

Listens to PostgreSQL changes via Supabase Realtime:

| Table | Event | Action |
|-------|-------|--------|
| orders | INSERT/UPDATE/DELETE | Invalidate `admin-orders` query |
| refund_requests | INSERT/UPDATE/DELETE | Invalidate `admin-refunds` query |
| products | INSERT/UPDATE/DELETE | Invalidate `products` query |

### Connection
- Single channel: `admin-realtime`
- Connection status tracked via `isConnected` state
- Shown as indicator in admin dashboard header

---

## 12. Storage Buckets

| Bucket | Public | Purpose | RLS |
|--------|--------|---------|-----|
| `product-images` | Yes | Product photography | SELECT: public, INSERT/UPDATE/DELETE: admin |
| `blog-images` | Yes | Blog post cover images | SELECT: public, INSERT/UPDATE/DELETE: admin |
| `return-images` | Yes | Customer return evidence | SELECT: public, INSERT: public, DELETE: admin |

### Image URL Pattern
```
https://<project-id>.supabase.co/storage/v1/object/public/<bucket>/<path>
```

---

## 13. Frontend State Management

### Cart (React Context + localStorage)
- **Source:** `src/context/CartContext.tsx`
- **Storage key:** `ss_cart`
- **Operations:** addItem, removeItem, updateQuantity, clearCart
- **Computed:** totalItems, totalAmount
- **Persistence:** Serialized to localStorage on every change
- **Size type:** `"2Y" | "3Y" | "4Y" | "5Y"`

### Server State (TanStack Query)
| Query Key | Hook | Source |
|-----------|------|--------|
| `["products"]` | `useProducts()` | `products` table |
| `["product", slug]` | `useProductBySlug(slug)` | Single product |
| `["admin-orders"]` | `useOrders()` | `orders` table (admin only) |
| `["blog-posts", published]` | `useBlogPosts(published)` | `blog_posts` table |
| `["blog-post", slug]` | `useBlogPostBySlug(slug)` | Single blog post |
| `["admin-refunds"]` | Used in AdminRefunds | `refund_requests` table |

### Admin Auth (React Context)
- **Source:** `src/hooks/useAdmin.tsx`
- **State:** session, isAdmin, loading
- **Methods:** signIn, signOut

---

## 14. API Data Flows

### Product Loading
```
Shop/Index → useProducts() → supabase.from("products").select("*") → ProductCard[]
```

### Order Placement (Razorpay)
```
Checkout → create-razorpay-order → Razorpay Modal → verify-razorpay-payment
  → supabase.from("orders").insert({...}) → /order-confirmation
```

### Order Placement (COD)
```
Checkout → supabase.from("orders").insert({...}) → /order-confirmation
```

### Admin Product CRUD
```
AdminProducts → supabase.from("products").insert/update/delete()
```

### Admin Order Management
```
AdminOrders → supabase.from("orders").select/update()
             → supabase.from("order_status_history").insert()
```

### Return Request (Customer)
```
/returns → Validate order (number + phone match)
         → Upload images to return-images bucket
         → supabase.from("refund_requests").insert()
```

### GST Report Export
```
AdminGSTReport → supabase.from("orders").select() with date filter
               → Client-side CSV generation (GSTR-1 compatible)
```

---

## 15. Admin Panel Architecture

### Source: `src/pages/Admin.tsx`

### Tabs
| Tab | Component | Features |
|-----|-----------|----------|
| Dashboard | `AdminDashboard` | Revenue summary, pending actions alert bar |
| Orders | `AdminOrders` | Status filters, one-click progression, bulk actions, tracking dialog, print invoice, CSV export |
| Customers | `AdminCustomers` | Customer list from orders, notes, tags |
| Inventory | `AdminProducts` | CRUD, featured toggle, stock management, image upload, restock history |
| Refunds | `AdminRefunds` | Status filters, detail drawer, approve/reject workflow |
| Marketing | `AdminMarketing` | Revenue chart, campaign placeholder |
| GST | `AdminGSTReport` | Monthly summary, GSTR-1 CSV export |
| Blog | `AdminBlog` | CRUD, publish/draft toggle |

### Layout
- **Desktop:** Sidebar navigation (all 8 tabs)
- **Mobile:** Bottom tab bar (7 tabs — Blog replaces GST; GST accessible via Dashboard card)
- **Realtime indicator:** Green/red dot showing connection status

---

## 16. Returns & Refund System

### Customer Flow (`/returns`)
1. Enter order number + phone number
2. System validates against orders table
3. Select request type: Refund / Exchange / Return
4. Select reason from predefined list
5. Optional: Upload evidence photos (stored in `return-images` bucket)
6. Submit → creates `refund_requests` record

### Admin Flow (`AdminRefunds`)
1. View requests filtered by status (Pending/Approved/Rejected/Processed)
2. Open detail drawer for each request
3. View customer photos, order details
4. Approve/Reject with admin notes
5. Set refund amount if applicable
6. Mark as Processed when complete

### Status Flow
```
pending → approved → processed
       → rejected
```

---

## 17. Blog / CMS

### Tables Used
- `blog_posts` — Content storage with publish/draft states

### Hooks
- `useBlogPosts(publishedOnly?)` — List with optional filter
- `useBlogPostBySlug(slug)` — Single post (published only for public)
- `useDeleteBlogPost()` — Admin deletion

### Routes
- `/blog` — Public listing (published only)
- `/blog/:slug` — Public single post
- Admin Blog tab — Full CRUD with draft/publish toggle

### Storage
- `blog-images` bucket for cover images (public read)

---

## 18. Legal Pages

| Route | Page | Key Content |
|-------|------|-------------|
| `/refund-policy` | RefundPolicy.tsx | 7-day return window, exchange policy, non-returnable items |
| `/shipping-policy` | ShippingPolicy.tsx | 1-2 day processing, 5-7 day delivery, free above ₹999 |
| `/privacy-policy` | PrivacyPolicy.tsx | Data collection, Razorpay reference, deletion rights |
| `/terms-of-service` | TermsOfService.tsx | Jurisdiction: Delhi courts, IT Act 2000 compliance |

All linked in site footer. Consistent hero banner styling.

---

## 19. Secrets & Environment Variables

### Auto-configured (`.env` — never edit manually)
| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Supabase API endpoint |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key |
| `VITE_SUPABASE_PROJECT_ID` | Project identifier |

### Cloud Secrets (Edge Functions only)
| Secret | Purpose | Used By |
|--------|---------|---------|
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side admin access | Edge functions |
| `RAZORPAY_KEY_ID` | Razorpay API auth | `create-razorpay-order` |
| `RAZORPAY_KEY_SECRET` | Razorpay API auth + HMAC | Both Razorpay functions |
| `VITE_RAZORPAY_KEY_ID` | Client-side Checkout.js | Frontend |
| `LOVABLE_API_KEY` | Lovable platform services | AI features |

**⚠️ Private keys are NEVER exposed in client code. They are only accessible from edge functions.**

---

## 20. Pending Integrations

### 20.1 COD OTP Verification (Twilio)
- **Status:** Architecture planned, not implemented
- **Requires:** Twilio Account SID, Auth Token, Phone Number
- **Flow:** Customer selects COD → OTP sent → verified before order creation
- **Edge function needed:** `send-cod-otp`, `verify-cod-otp`
- **DB:** OTP stored server-side with 5-min expiry, max 3 attempts

### 20.2 Shiprocket Integration
- **Status:** Not started
- **Plan:** Edge function to push orders to Shiprocket API
- **Webhook:** For tracking number and status updates

### 20.3 Email Notifications
- **Status:** ✅ Implemented
- **Edge functions:** `send-order-confirmation`, `send-shipping-notification`
- **Templates:** Shared in `supabase/functions/_shared/emailTemplates.ts`
- **Provider:** Resend API

### 20.4 WhatsApp Notifications
- **Status:** Manual templates available in admin (copy-to-clipboard)
- **Plan:** Automate via WhatsApp Business API or Twilio WhatsApp

### 20.5 Product Image Upload
- **Status:** ✅ Implemented
- **Features:** Multi-image upload (max 5), drag-to-reorder, cover image badge, delete from storage

### 20.6 Invoice PDF Storage
- **Status:** HTML print-based invoicing works
- **Plan:** Generate actual PDFs, store in `invoices` bucket, attach to emails

### 20.7 Customer Order Tracking
- **Status:** ✅ Implemented
- **Routes:** `/track` and `/track/:order_number`
- **Features:** Order number + phone lookup, status timeline, tracking number display

---

## 21. Security Checklist

| ✅ | Control |
|----|---------|
| ✅ | RLS enabled on ALL tables |
| ✅ | Admin role checked server-side via `has_role()` SECURITY DEFINER |
| ✅ | No client-side role storage (no localStorage admin flags) |
| ✅ | Private API keys only in edge functions (never in client bundle) |
| ✅ | Razorpay signature verification via HMAC-SHA256 |
| ✅ | GSTIN validation via regex before submission |
| ✅ | Email normalization (trim + lowercase) on auth |
| ✅ | Orders table: public INSERT, admin-only SELECT/UPDATE, no DELETE |
| ✅ | User roles: admin-only SELECT, no public INSERT/UPDATE/DELETE |
| ✅ | Auth session with auto-refresh tokens |
| ⬜ | COD OTP verification (planned) |
| ✅ | Rate limiting on order creation (order_rate_limits table) |
| ⬜ | CAPTCHA on checkout forms (planned) |

---

## 22. Routing Map

| Route | Page Component | Auth | Purpose |
|-------|---------------|------|---------|
| `/` | Index | No | Homepage with hero, featured products |
| `/shop` | Shop | No | Full product catalog with filters |
| `/product/:slug` | ProductDetail | No | Single product with size selection |
| `/cart` | Cart | No | Shopping cart |
| `/checkout` | Checkout | No | Checkout form with GST breakdown |
| `/order-confirmation` | OrderConfirmation | No | Thank you page |
| `/track` `/track/:order_number` | OrderTracking | No | Order status tracking |
| `/admin` | Admin | Yes (admin) | Full admin dashboard |
| `/reset-password` | ResetPassword | No | Password reset form |
| `/sitemap.xml` | SitemapRedirect | No | Redirects to dynamic sitemap edge function |
| `/about` | About | No | Brand story |
| `/blog` | Blog | No | Published blog posts |
| `/blog/:slug` | BlogDetail | No | Single blog post |
| `/contact` | Contact | No | Contact form |
| `/returns` | Returns | No | Return/refund request form |
| `/refund-policy` | RefundPolicy | No | Legal: returns policy |
| `/shipping-policy` | ShippingPolicy | No | Legal: shipping info |
| `/privacy-policy` | PrivacyPolicy | No | Legal: privacy policy |
| `/terms-of-service` | TermsOfService | No | Legal: terms & conditions |
| `*` | NotFound | No | 404 page |

---

*Document prepared by the Style Saplings tech team.*  
*For questions, contact support@stylesaplings.com*  
*Last updated: March 2026*
