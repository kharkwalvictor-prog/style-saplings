# Style Saplings — Admin Panel Architecture

**Version:** 2.0  
**Date:** March 2026  
**Prepared for:** Tech Team Review  

---

## Table of Contents

1. [Overview](#1-overview)
2. [Authentication & Access](#2-authentication--access)
3. [Layout & Navigation](#3-layout--navigation)
4. [Tab 1: Dashboard](#4-tab-1-dashboard)
5. [Tab 2: Orders](#5-tab-2-orders)
6. [Tab 3: Customers](#6-tab-3-customers)
7. [Tab 4: Inventory](#7-tab-4-inventory)
8. [Tab 5: Refunds](#8-tab-5-refunds)
9. [Tab 6: GST Report](#9-tab-6-gst-report)
10. [Tab 7: Marketing](#10-tab-7-marketing)
11. [Tab 8: Blog](#11-tab-8-blog)
12. [Realtime System](#12-realtime-system)
13. [Backend Dependencies](#13-backend-dependencies)
14. [Data Flow Diagrams](#14-data-flow-diagrams)
15. [Missing Features & Roadmap](#15-missing-features--roadmap)

---

## 1. Overview

The admin panel is a real-time CRM and operations dashboard accessible at `/admin`. It is a single-page interface with 8 tabs covering the full business operations lifecycle: order management, inventory, customer CRM, returns processing, GST compliance, marketing, and content management.

### Key Capabilities
- Real-time order feed with live status updates
- One-click order status progression (pending → processing → packed → shipped)
- Full product CRUD with image upload to cloud storage
- Customer CRM with tagging, notes, and segmentation
- Returns & refund workflow with WhatsApp templates
- GST-compliant reporting with GSTR-1 CSV export
- Discount code management
- Blog CMS with draft/publish workflow

### Source Files
| File | Purpose |
|------|---------|
| `src/pages/Admin.tsx` | Main layout, tab routing, auth gate |
| `src/pages/AdminLogin.tsx` | Login form |
| `src/hooks/useAdmin.tsx` | Auth context + role verification |
| `src/hooks/useAdminRealtime.ts` | Realtime subscriptions |
| `src/hooks/useOrders.ts` | Orders query + status mutation |
| `src/hooks/useProducts.ts` | Products query |
| `src/hooks/useBlogPosts.ts` | Blog query + mutations |
| `src/components/admin/Admin*.tsx` | 8 tab components |
| `src/utils/invoiceUtils.ts` | Invoice HTML generation, CSV export |
| `src/utils/gstUtils.ts` | GST calculation engine |

---

## 2. Authentication & Access

### Flow
```
User visits /admin
  → useAdmin checks session
  → If no session → AdminLogin rendered
  → User enters email/password
  → supabase.auth.signInWithPassword()
  → On auth success → has_role(uid, 'admin') RPC
  → If admin role confirmed → Admin panel renders
  → If not admin → stays on login with error
```

### Security Details
- **Email normalization:** `trim().toLowerCase()` before auth call
- **Role check:** Server-side via `has_role()` SECURITY DEFINER function
- **No client-side role storage:** Never uses localStorage for admin status
- **Safety timeout:** 5-second max on role verification to prevent infinite loading
- **Session persistence:** Supabase auto-refresh tokens

### Password Reset
- Login form has "Forgot Password?" link
- Sends magic link email via Supabase Auth
- User redirected to `/reset-password` to set new password

### Setting Up Admin Users
```sql
-- 1. Create user in Lovable Cloud → Users section
-- 2. Insert admin role:
INSERT INTO user_roles (user_id, role) VALUES ('<user-uuid>', 'admin');
```

---

## 3. Layout & Navigation

### Desktop Layout
```
┌──────────────────────────────────────────────┐
│ [Style Saplings]        [● Live]  [Logout]   │  ← Header (sticky)
├──────────┬───────────────────────────────────┤
│ Dashboard│                                   │
│ Orders   │                                   │
│ Customers│         Main Content Area         │
│ Inventory│         (tab-dependent)           │
│ Refunds  │                                   │
│ GST      │                                   │
│ Marketing│                                   │
│ ──────── │                                   │
│ 📝 Blog  │                                   │
└──────────┴───────────────────────────────────┘
         ↑ Sidebar (w-56, sticky)
```

### Mobile Layout
```
┌──────────────────────────────────────────────┐
│ [Style Saplings]        [● Live]  [Logout]   │  ← Header
├──────────────────────────────────────────────┤
│                                              │
│              Main Content Area               │
│              (scrollable, pb-20)             │
│                                              │
├──────────────────────────────────────────────┤
│ 📊  🛍️  👥  📦  🔄  📝  📣               │  ← Bottom tab bar (fixed)
└──────────────────────────────────────────────┘
```

**Mobile Nav Note:** Blog (📝) replaces GST (🧾) in the mobile bottom bar since blog management is needed more frequently. GST is accessible via a quick-access card on the Dashboard tab (mobile only).

### Connection Indicator
- Green dot + "Live" = Realtime channel subscribed
- Red dot + "Offline" = Realtime disconnected

---

## 4. Tab 1: Dashboard

**Component:** `src/components/admin/AdminDashboard.tsx`  
**Data Sources:** `useOrders()`, `useProducts()`

### Sections

#### 4.1 Pending Actions Alert Bar
- Amber banner shown when there are unprocessed orders or out-of-stock items
- Clickable links navigate to relevant tabs
- Format: "X orders unprocessed · Y items out of stock — Review Now →"

#### 4.2 Revenue Cards (4-column grid)
| Card | Calculation |
|------|-------------|
| Today's Revenue | Sum of `total_amount` where `created_at` starts with today's date |
| This Week | Sum where `created_at` >= 7 days ago |
| This Month | Sum where `created_at` >= first of current month |
| All Time | Sum of all orders |

#### 4.3 Order Status Cards (4-column grid)
- Today's Orders (count)
- Pending (count)
- Processing (count)
- Shipped (count)

#### 4.4 Live Order Feed
- Shows last 20 orders, sorted by `created_at DESC`
- Each row: timestamp (relative), order #, customer name, amount, payment badge, status badge
- One-click advance button (e.g., "→ processing")
- "View All (X) →" link if >20 orders → navigates to Orders tab
- Real-time indicator: "🟢 Real-time"

#### 4.5 Low Stock Alerts
- Products where `stock_count <= low_stock_threshold`
- Shows product name, craft type, remaining count
- "Update" button → navigates to Inventory tab

#### 4.6 Recent Customers
- Derived from orders (not a separate table)
- Groups by email/phone, shows name, phone, order count, total spent
- Top 5 displayed

#### 4.7 GST Quick Access (Mobile Only)
- A "📊 GST Report →" card shown at the bottom of the Dashboard on mobile (`md:hidden`)
- Navigates to the GST tab via `onNavigate("gst")`
- Provides access to GST reporting without occupying a permanent mobile nav slot

### Order Advancement Logic
```typescript
const nextStatus = {
  pending: "processing",
  processing: "packed",
  packed: "shipped",
};
// On "shipped": prompts for optional tracking number
// Logs to order_status_history table
```

---

## 5. Tab 2: Orders

**Component:** `src/components/admin/AdminOrders.tsx` (490 lines)  
**Data Sources:** `useOrders()`, `useUpdateOrderStatus()`

### Features

#### 5.1 Filter Bar
- **Status filters:** All, Pending, Processing, Packed, Shipped, Delivered, Cancelled (pill buttons)
- **Payment filters:** All, Razorpay, COD
- **Search:** Order #, customer name, or phone

#### 5.2 Bulk Actions
- Checkbox selection (individual + select all)
- Actions when selected: Mark Processing, Mark Packed, Export CSV, Print Invoices, Clear
- CSV export via `exportOrdersCSV()` from `invoiceUtils.ts`

#### 5.3 Order Table (Desktop)
| Column | Content |
|--------|---------|
| ☐ | Checkbox |
| Order # | Monospace font |
| Date | "dd MMM, hh:mm a" format |
| Customer | Name + phone |
| Total | ₹ formatted |
| Payment | Method badge + status badge |
| Status | Color-coded badge |
| Action | "→ next status" button |

#### 5.4 Order Cards (Mobile)
- Compact card with order #, status, customer name, total, advance button

#### 5.5 Order Detail Drawer (Sheet)
Opens on row click. Contains:
- **Status progression bar:** Visual pipeline (pending → processing → packed → shipped → delivered)
- **Customer info:** Name, phone, email
- **Items list:** Product name, size, qty, price, image thumbnail
- **Shipping address:** Full address with copy-to-clipboard
- **Tracking number:** Input field + save button
- **Order notes:** Add/view admin notes (stored in `order_notes` table)
- **Status history:** Timeline from `order_status_history` table
- **Actions:**
  - Advance status button
  - WhatsApp message (pre-formatted with order details)
  - Download invoice (calls `generate-invoice` edge function)
  - Print invoice (HTML-based)

#### 5.6 Cancellation Reason Dialog
- When admin clicks "Cancel" on an order, a dialog prompts for a mandatory reason
- **Predefined reasons:** Customer requested, Duplicate order, Item out of stock, Suspected fake/fraud, Payment issue
- **"Other" option:** Free text input for custom reasons
- On confirm: updates `order_status = 'cancelled'` and `cancel_reason = selectedReason`
- Logs to `order_status_history` as usual
- **Display:** `cancel_reason` shown in Order Detail Drawer (red text) when status is `cancelled`

#### 5.7 Tracking Number Dialog
- When advancing to "shipped," a modal prompts for optional tracking number
- On confirm: saves tracking number + advances status
- Triggers `send-shipping-notification` edge function

#### 5.7 Invoice Generation
- **Print Invoice:** `printInvoice()` — opens browser print dialog with GST-compliant HTML
- **Download Invoice:** Calls `generate-invoice` edge function → returns signed URL → opens in new tab
- **Bulk Print:** `printMultipleInvoices()` — prints multiple invoices sequentially

### Edge Function Integrations
| Trigger | Edge Function | When |
|---------|--------------|------|
| Status → shipped | `send-shipping-notification` | After tracking saved |
| Download invoice | `generate-invoice` | On button click |

---

## 6. Tab 3: Customers

**Component:** `src/components/admin/AdminCustomers.tsx`  
**Data Sources:** `useOrders()` (customers derived from orders)

### Customer Data Model
Customers are NOT stored in a separate table. They are derived from orders by grouping on `customer_email`:

```typescript
interface Customer {
  email: string;
  name: string;
  phone: string;
  orderCount: number;
  totalSpent: number;
  lastOrder: string;    // ISO date
  firstOrder: string;   // ISO date
  orders: DbOrder[];    // All orders by this customer
}
```

### Segmentation Filters
| Segment | Logic |
|---------|-------|
| All | No filter |
| Repeat | `orderCount >= 2` |
| High Value | `totalSpent >= 3000` |
| COD Only | All orders have `payment_method === 'cod'` |
| Inactive (60d) | `lastOrder < 60 days ago` |

### Search
- Filters on name, email, or phone

### Customer Detail Drawer
Opens on row click. Contains:

#### Stats (4-card grid)
- Total Orders, Total Spent, Avg Order Value, Last Order Date

#### Auto-Tags (computed, not stored)
| Condition | Tag |
|-----------|-----|
| `orderCount >= 2` | 🟢 Repeat Customer |
| `totalSpent >= 3000` | 🟡 High Value |
| All orders COD | 🔵 COD Customer |
| Any festive item purchased | 🟠 Festive Buyer |

#### Manual Tags
- Stored in `customer_tags` table (keyed by `customer_email`)
- Add/remove with inline input
- Examples: "VIP", "Wholesale Inquiry"

#### Notes
- Stored in `customer_notes` table
- Textarea + save button
- Displayed in reverse chronological order

#### Order History
- All orders by this customer with order #, date, amount

#### Actions
- **WhatsApp:** Opens `wa.me` with customer phone
- **Email:** Opens `mailto:` with customer email

### Database Tables Used
| Table | Operations |
|-------|-----------|
| `customer_tags` | SELECT, INSERT, DELETE (admin RLS) |
| `customer_notes` | SELECT, INSERT (admin RLS) |

---

## 7. Tab 4: Inventory

**Component:** `src/components/admin/AdminProducts.tsx`  
**Data Sources:** `useProducts()`

### Product Table
| Column | Content |
|--------|---------|
| Name | Product name |
| Craft | Craft type enum |
| Price | ₹ formatted |
| Stock | Color-coded badge (in_stock/low_stock/out_of_stock) |
| Count | Editable number input (inline update on blur) |
| Supplier | Supplier notes (truncated) |
| Actions | Edit ✏️ / Delete 🗑️ |

### Inline Stock Update
- Number input in table row
- On blur: calls `supabase.from("products").update({ stock_count, stock_status })`
- Auto-determines status: 0 → out_of_stock, ≤5 → low_stock, >5 → in_stock

### Product Form (Create/Edit)
Renders inline above table.

| Field | Type | Required |
|-------|------|----------|
| Name | Text | ✅ |
| Slug | Text (auto-generated from name) | Auto |
| Price | Number | ✅ |
| Sale Price | Number | No |
| Craft Type | Select (4 options) | ✅ |
| Stock Status | Select (3 options) | ✅ |
| Category | Text | No |
| Stock Count | Number | No (default 0) |
| Low Stock Threshold | Number | No (default 5) |
| Sizes | Checkboxes (2Y, 3Y, 4Y, 5Y) | No |
| Featured | Checkbox | No |
| Supplier Notes | Textarea | No |
| Description | Textarea | No |

### Image Upload
- **Storage bucket:** `product-images`
- **Max images:** 5 per product
- **Max file size:** 5MB
- **Accepted types:** JPEG, PNG, WEBP
- **Path pattern:** `{slug}/{timestamp}-{filename}`
- **Features:**
  - Drag-and-drop reordering (first image = cover)
  - Delete button per image (removes from storage)
  - Cover badge on first image
  - Upload progress indicator

### CRUD Operations
| Action | Supabase Call |
|--------|--------------|
| Create | `supabase.from("products").insert(data)` |
| Update | `supabase.from("products").update(data).eq("id", id)` |
| Delete | `supabase.from("products").delete().eq("id", id)` with confirm() |
| Stock | `supabase.from("products").update({ stock_count, stock_status }).eq("id", id)` |

### Restock History (Collapsible Section)
Located at the bottom of the Inventory tab, default collapsed.

- **Data:** Last 30 entries from `restock_history` table, ordered by `created_at DESC`
- **Stat:** "X restock events this month" counter above the table
- **Table Columns:** Date & Time | Product | Change | Updated by
- **Change formatting:**
  - Green `↑` for stock increases (e.g., "↑ 0 → 8 units")
  - Orange `↓` for decreases (e.g., "↓ 10 → 4 units")
  - Red for zero stock (e.g., "↓ 3 → 0 (Out of Stock)")
- **Lazy loaded:** Query only fires when section is expanded

---

## 8. Tab 5: Refunds

**Component:** `src/components/admin/AdminRefunds.tsx`  
**Data Sources:** `refund_requests` table via direct query

### Status Filters
- All (count), Pending (count), Approved (count), Rejected (count), Processed (count)

### Refund Table (Desktop) / Cards (Mobile)
| Column | Content |
|--------|---------|
| Date | "dd MMM yyyy" |
| Order # | Monospace |
| Customer | Name |
| Type | refund/exchange/return |
| Reason | Truncated |
| Status | Color badge |
| Action | "Review" button |

### Refund Detail Drawer
Opens on click. Contains:

#### Request Details
- Type, reason, description
- Customer-uploaded images (linked to `return-images` bucket)

#### Customer Info
- Name, phone, email

#### Original Order
- Total amount, payment method/status (fetched via `order_id` FK)

#### Admin Actions
| Field | Type |
|-------|------|
| Status | Select: Pending, Approved, Rejected, Processed |
| Refund Amount | Number input (shown for approved/processed) |
| Admin Notes | Textarea (internal only) |
| Save | Updates `refund_requests` row |

When status is approved/rejected/processed, `resolved_at` is auto-set.

#### WhatsApp Templates
Pre-formatted messages opened via `wa.me`:
- ✅ **Approved:** Includes refund amount and 5-7 day timeline
- ❌ **Rejected:** Polite rejection with support invitation
- ℹ️ **Need Info:** Request for additional details

### Refund Status Flow
```
pending → approved → processed
       → rejected
```

---

## 9. Tab 6: GST Report

**Component:** `src/components/admin/AdminGSTReport.tsx`  
**Data Sources:** `useOrders()`, `gstUtils.ts`

### Month Selector
- Dropdown with last 12 months
- All calculations filtered by selected month

### Summary Cards (4-column grid)
| Card | Content |
|------|---------|
| Total Sales (incl GST) | Sum of `total_amount` |
| Total Taxable Value | Sum of base prices (excl GST) |
| Total GST Liability | Sum of all GST components |
| Orders | Count of orders in month |

### Tax Breakdown
- CGST Collected (intra-state)
- SGST Collected (intra-state)
- IGST Collected (inter-state)
- GST on 5% items (subtotal)
- **Total GST Liability** (bold)

### GST Calculation Logic
Uses pre-stored `gst_breakdowns` JSONB from order if available.  
Falls back to recalculating via `calculateGST()` from `gstUtils.ts`.

### Order Distribution
- Intra-state (Delhi) count
- Inter-state count
- B2B (with GSTIN) count

### Export Actions
| Button | Function |
|--------|----------|
| GSTR-1 CSV | `exportGSTR1CSV()` — generates CSV compatible with GST portal format |
| Invoices | Bulk download — calls `generate-invoice` for each order in month |

---

## 10. Tab 7: Marketing

**Component:** `src/components/admin/AdminMarketing.tsx`  
**Data Sources:** `useOrders()`, `discount_codes` table

### Stats Cards (3-column grid)
| Card | Source |
|------|--------|
| Total Subscribers | Unique emails from orders |
| Repeat Customers | Customers with 2+ orders |
| COD Orders | Count of COD payment method |

### Discount Codes Management

#### Table
| Column | Content |
|--------|---------|
| Code | Monospace, uppercase |
| Type | percentage/fixed/shipping |
| Value | "20%" or "₹100" or "Free Ship" |
| Min Order | ₹ amount |
| Used | Usage count |
| Limit | Usage limit or ∞ |
| Valid Until | Date or "No expiry" |
| Status | Active/inactive toggle (Switch) |
| Actions | Delete button |

#### Create Code Dialog
| Field | Type | Required |
|-------|------|----------|
| Code | Text (auto-uppercase) | ✅ |
| Description | Text | No |
| Type | Select: Percentage Off, Fixed Amount, Free Shipping | ✅ |
| Value | Number | ✅ |
| Min Order (₹) | Number | No (default 0) |
| Usage Limit | Number | No (unlimited) |
| Valid From | Date | No (default today) |
| Valid Until | Date | No (no expiry) |
| Active | Switch | No (default true) |

#### Validation
- Duplicate code check via Supabase unique constraint
- Type-specific value validation

### Monthly Revenue Chart
- Last 6 months
- Horizontal bar chart (CSS-based, not Recharts)
- Shows month name, bar, ₹ value

### Campaign History
- Placeholder table ("No campaigns sent yet")
- Ready for email service integration

---

## 11. Tab 8: Blog

**Component:** `src/components/admin/AdminBlog.tsx`  
**Data Sources:** `useBlogPosts()`, `useDeleteBlogPost()`

### Blog Posts Table
| Column | Content |
|--------|---------|
| Title | Post title |
| Category | Heritage, Sustainability, Styling Tips, etc. |
| Status | Published (green) / Draft (gray) |
| Date | Published date |
| Actions | Edit ✏️ / Delete 🗑️ |

### Blog Post Form (Create/Edit)
| Field | Type | Required |
|-------|------|----------|
| Title | Text | ✅ |
| Slug | Text (auto-generated) | Auto |
| Category | Select (6 options) | No |
| Published | Checkbox | No |
| Excerpt | Textarea (max 200 chars) | No |
| Content | Textarea (markdown/HTML) | No |
| Cover Image | File upload | No |

### Categories
Heritage, Sustainability, Styling Tips, Craft Stories, How To, Care Tips

### Cover Image Upload
- **Storage bucket:** `blog-images`
- **Max size:** 5MB
- **Types:** JPEG, PNG, WEBP
- **Path:** `{slug}/{timestamp}-{filename}`
- Remove button deletes from storage

### Publishing Logic
- Setting `published = true` auto-sets `published_at` to current timestamp
- Unpublishing retains the original `published_at`
- Public blog page only shows `published = true` posts

---

## 12. Realtime System

**Source:** `src/hooks/useAdminRealtime.ts`

### Architecture
```
PostgreSQL → Supabase Realtime → WebSocket → Admin Browser
```

### Subscriptions
Single channel `admin-realtime` listens to:

| Table | Events | On Change |
|-------|--------|-----------|
| `orders` | INSERT, UPDATE, DELETE | Invalidate `admin-orders` query → Dashboard + Orders auto-refresh |
| `refund_requests` | INSERT, UPDATE, DELETE | Invalidate `admin-refunds` query → Refunds tab auto-refresh |
| `products` | INSERT, UPDATE, DELETE | Invalidate `products` query → Inventory tab auto-refresh |

### Connection States
| Status | Display |
|--------|---------|
| `SUBSCRIBED` | 🟢 Live |
| Other | 🔴 Offline |

### Cleanup
Channel is removed on component unmount via `supabase.removeChannel()`.

---

## 13. Backend Dependencies

### Database Tables Used by Admin

| Table | Tabs Using It | Operations |
|-------|--------------|------------|
| `orders` | Dashboard, Orders, Customers, GST, Marketing | SELECT, UPDATE |
| `products` | Dashboard, Inventory | SELECT, INSERT, UPDATE, DELETE |
| `order_status_history` | Orders (drawer) | SELECT, INSERT |
| `order_notes` | Orders (drawer) | SELECT, INSERT |
| `refund_requests` | Refunds | SELECT, UPDATE |
| `customer_tags` | Customers | SELECT, INSERT, DELETE |
| `customer_notes` | Customers | SELECT, INSERT |
| `discount_codes` | Marketing | SELECT, INSERT, UPDATE, DELETE |
| `blog_posts` | Blog | SELECT, INSERT, UPDATE, DELETE |
| `restock_history` | Inventory | SELECT |
| `email_log` | (not exposed in UI) | INSERT (via edge functions) |
| `invoice_sequence` | (via edge function) | Called by `generate-invoice` |
| `invoices` | (via edge function) | Created by `generate-invoice` |

### Storage Buckets Used
| Bucket | Tab | Operations |
|--------|-----|-----------|
| `product-images` | Inventory | Upload, delete, public URL |
| `blog-images` | Blog | Upload, delete, public URL |
| `return-images` | Refunds (read only) | View customer uploads |

### Edge Functions Called
| Function | Tab | Trigger |
|----------|-----|---------|
| `generate-invoice` | Orders | Download invoice button |
| `send-shipping-notification` | Orders | Status → shipped |
| `send-order-confirmation` | (automatic) | Order placement |

### RLS Policies (Admin)
All admin operations require `has_role(auth.uid(), 'admin')` check.  
The admin must be authenticated via `useAdmin` context before any data operations succeed.

---

## 14. Data Flow Diagrams

### Order Lifecycle (Admin Side)
```
New Order (customer checkout)
    │
    ▼
Dashboard: appears in Live Feed + Pending Actions
    │
    ▼ (click "→ processing")
Order Status: pending → processing
    │ (logged to order_status_history)
    ▼ (click "→ packed")
Order Status: processing → packed
    │
    ▼ (click "→ shipped")
Tracking Dialog opens → enter tracking number (optional)
    │
    ├─► order.tracking_number updated
    ├─► order_status: packed → shipped
    ├─► order_status_history: logged
    └─► send-shipping-notification edge function triggered
        └─► Email sent to customer with tracking info
```

### Customer CRM Flow
```
Orders table
    │
    ▼ (grouped by customer_email)
Customer list with stats
    │
    ▼ (click customer)
Customer Drawer
    ├─► Auto-tags computed (repeat, high-value, etc.)
    ├─► Manual tags loaded from customer_tags
    ├─► Notes loaded from customer_notes
    └─► Order history displayed
```

### Refund Processing Flow
```
Customer submits return request (/returns page)
    │
    ▼
refund_requests table (status: pending)
    │
    ▼ (admin opens Refunds tab)
Review request → set status + notes + amount
    │
    ├─► Approved: set refund_amount, resolved_at
    │   └─► WhatsApp: approved template
    │
    ├─► Rejected: set admin_notes, resolved_at
    │   └─► WhatsApp: rejected template
    │
    └─► Processed: final state (refund issued)
```

### Invoice Generation Flow
```
Admin clicks "Download Invoice" on order
    │
    ▼
generate-invoice edge function
    ├─► Fetch order + items from DB
    ├─► Calculate GST per item
    ├─► Get next invoice number (get_next_invoice_number)
    ├─► Generate HTML → convert to PDF
    ├─► Upload to invoices storage bucket
    ├─► Create invoices table record
    └─► Return signed URL (7-day expiry)
```

---

## 15. Missing Features & Roadmap

### Not Yet Built
| Feature | Priority | Complexity | Notes |
|---------|----------|------------|-------|
| Bulk product import (CSV) | Medium | Low | Parse CSV → batch insert |
| Product reviews moderation UI | Low | Medium | `product_reviews` table exists |
| Email campaign sending | Medium | High | Needs email service integration |
| Abandoned cart recovery | Low | High | Requires customer accounts |
| Analytics dashboard (charts) | Medium | Medium | Recharts already installed |
| Bulk order printing (thermal) | Low | Medium | Shipping label format |
| Inventory alerts (email) | Medium | Low | Edge function on stock change |
| Multi-admin with activity log | Low | Medium | Track which admin did what |
| Product variants (color) | Low | High | Schema change needed |
| ~~Order cancellation with reason~~ | ~~Medium~~ | ~~Low~~ | ✅ Implemented — cancel_reason column + dialog |

### Known Limitations
1. **Customer data is order-derived** — No dedicated customer table. If a customer uses different emails, they appear as separate customers.
2. **No undo on status changes** — Status can only advance forward (except cancel).
3. **Invoice GSTIN hardcoded** — `invoiceUtils.ts` has placeholder GSTIN. Should read from `gst_config` table.
4. **Single admin role** — No granular permissions (e.g., view-only, orders-only).
5. **No pagination** — All data loaded at once. Works for current scale (<1000 orders) but needs pagination for growth.

---

*Document prepared by the Style Saplings tech team.*  
*For questions, contact support@stylesaplings.com*  
*Last updated: March 2026*
