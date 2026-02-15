# Admin Panel – Feature Requirements (Complete)

This document captures all feature requirements for the City Plus Pet Shop admin panel, derived from conversation history and design references.

---

## I. Core Layout & Structure

### 1. Left Sidebar Navigation
- **Visibility:** Sidebar MUST be visible on all `/admin/*` routes EXCEPT `/admin/login`
- **Branding:** "Admin Panel" title with store icon at top
- **Navigation links:**
  - Dashboard (`/admin`)
  - Products (`/admin/products`)
  - Orders (`/admin/orders`)
  - Payments (`/admin/payments`)
  - Checkout Settings (`/admin/checkout-settings`)
  - Store Settings (`/admin/settings`)
  - Analytics (`/admin/analytics`)
- **User section:** Avatar (initial), name ("Admin"), email (e.g. `admin@store.com`)
- **Sign Out:** Red logout button at bottom
- **Responsive:** Sidebar slides in/out on mobile; fixed/visible on desktop (lg breakpoint)

### 2. Top Header Bar
- **Search:** Input with placeholder "Search products, orders..."
- **Notifications:** Bell icon with red badge for unread
- **View Store:** Button to navigate to public storefront
- **Mobile:** Hamburger menu to toggle sidebar

### 3. Main Content Area
- Central area for page-specific content
- Consistent padding and spacing

### 4. Login Page (`/admin/login`)
- **Minimal layout:** NO sidebar, NO header
- Centered login form only
- Background: gradient (slate-50, blue-50, slate-100)

---

## II. Authentication & Authorization

### 1. Admin Login
- Use Supabase Auth: `signInWithPassword({ email, password })`
- **Browser env only:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **No config gates:** Never show "Configure Supabase Auth for production" or similar
- **Allowed messages only:** Invalid credentials, Access denied, Access check failed, Login failed

### 2. Authorization Flow
- After auth: check `team_members` by email (case-insensitive)
- **Authorized:** Redirect to `/admin/dashboard` (or `/admin`)
- **Unauthorized:** Sign out + show "Access denied. You are not authorized to access the admin panel."
- **RLS failure:** Show "Access check failed. Please contact support."
- **Role check:** Accept `admin` or `adm` in `team_members.role`

### 3. RLS
- `team_members` policy: `USING (lower(auth.email()) = lower(email))` for SELECT

---

## III. No Config-Gate Messaging

- **UI pages:** Never show "Supabase Not Configured", "Configure Supabase", or red config-gate text
- **Fallback messages:** "Unable to load...", "Service temporarily unavailable. Please try again later."
- **API routes:** May return `{ error: "Service unavailable" }` with status 500 (no Supabase-specific text in responses)

---

## IV. Dynamic Routes

- `export const dynamic = "force-dynamic"` on:
  - `/api/payment-gateways`
  - `/admin/orders`
  - `/admin/login` (via layout)

---

## V. Dashboard (`/admin`)

- **KPIs:** Total Revenue, Total Orders, Products, Customers
- **Charts:** Sales Overview (line/area), Category Distribution (pie)
- **Recent Orders:** Table with Order ID, Customer, Total, Status, Date
- **Loading:** Timeout + fallback to demo data if Supabase fetch hangs or fails
- **Never:** Infinite loading spinner

---

## VI. Products (`/admin/products`)

- Product list with search/filter
- Add new product, edit, bulk actions
- Table: image, name, price, stock, status, actions

---

## VII. Orders (`/admin/orders`)

- Order list with search (Order ID, customer name, email)
- Status filter dropdown
- Table: Order ID, Customer, Total, Status, Date, Actions
- Order detail view (`/admin/orders/[id]`)
- Order notes (admin, courier, system)
- Bulk courier booking

---

## VIII. Payments (`/admin/payments`)

- Payment gateways configuration
- Enable/disable gateways
- Configure API credentials per gateway
- Zero-Code Payment Management: active methods appear in checkout
- Bangladesh market focus

---

## IX. Checkout Settings (`/admin/checkout-settings`)

- Delivery fees
- Free shipping rules
- Checkout policies

---

## X. Store Settings (`/admin/settings`)

- Store identity, branding, business information
- Logo/favicon upload
- Contact info

---

## XI. Analytics (`/admin/analytics`)

- **Analytics & Events:** Event data similar to Meta Events Manager
- **Standard events:** ViewContent, Search, AddToCart, InitiateCheckout, AddPaymentInfo, Purchase
- **Filters:** Event name dropdown, Date range (From/To)
- **Actions:** Refresh, Export CSV
- **Event Debug Panel:** Last 200 events, source (browser/server), dedup by `event_id`
- Meta Pixel / CAPI configuration

---

## XII. Technical Constraints

- Next.js 14 App Router
- Supabase for auth and data
- No breaking Supabase auth
- Existing admin header/topbar kept intact
- Sidebar width: 256px (`w-64`)
- No overflow clipping of sidebar container

---

## XIII. Verification Checklist

| Route            | Sidebar | Header |
|------------------|---------|--------|
| `/admin`         | Yes     | Yes    |
| `/admin/products`| Yes     | Yes    |
| `/admin/orders`  | Yes     | Yes    |
| `/admin/payments`| Yes    | Yes    |
| `/admin/checkout-settings` | Yes | Yes |
| `/admin/settings`| Yes     | Yes    |
| `/admin/analytics`| Yes    | Yes    |
| `/admin/login`   | No      | No     |
