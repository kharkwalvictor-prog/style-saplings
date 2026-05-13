# Style Saplings — Shipping Integration Plan

## Recommendation: Shiprocket (LITE plan — FREE)

**Why Shiprocket:**
- Free for up to 60 shipments/month (LITE plan)
- 25+ courier partners (Delhivery, BlueDart, DTDC, Ecom Express, etc.)
- Best API documentation among Indian aggregators
- COD support with 8-10 day remittance
- Label generation, tracking, pickup scheduling
- AI-based courier selection (CORE engine)
- API Docs: https://apidocs.shiprocket.in/

**Cost estimate (30 orders/month):** ~Rs 800-1,200/month total shipping cost

## Setup Steps

### Step 1: Shiprocket Account
1. Sign up at shiprocket.in
2. Complete KYC: PAN, bank account
3. Add pickup address
4. Note login email/password for API

### Step 2: Database Migration
Create `shipments` table and `shipping-labels` storage bucket (SQL in codebase)

### Step 3: Edge Functions
- `create-shipment` — creates Shiprocket order, assigns AWB, schedules pickup
- `get-shipping-label` — fetches label PDF
- `track-shipment` — real-time tracking via AWB
- `webhook-shipping-update` — receives status push notifications

### Step 4: Admin UI
- "Ship Order" dialog replaces manual tracking number input
- Shows available couriers with rates
- Auto-fills AWB, generates label
- Live tracking in order detail drawer

### Step 5: Secrets Required
```
SHIPROCKET_EMAIL=your-email
SHIPROCKET_PASSWORD=your-password
```

## Full technical plan in docs/SHIPPING_INTEGRATION.md
