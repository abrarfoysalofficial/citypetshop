# 🛠️ Technical Implementation Guide

## Architecture Overview

This project implements a Zero-Code manageable e-commerce platform where all configurations are stored in Supabase and managed through an admin UI.

---

## Data Flow Diagram

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│   Next.js Server    │
│   (App Router)      │
└──────┬──────────────┘
       │
       ├──► Context Providers (Client)
       │    └─► SiteSettingsContext
       │         - Fetches site_settings
       │         - Provides to all components
       │
       ├──► API Routes
       │    ├─► /api/admin/settings (PATCH)
       │    ├─► /api/admin/payment-gateways (GET/PATCH)
       │    ├─► /api/payment-gateways (GET public)
       │    ├─► /api/admin/products (GET/POST/PATCH/DELETE)
       │    ├─► /api/admin/products/stock (PATCH)
       │    ├─► /api/admin/orders/status (PATCH)
       │    └─► /api/invoice (GET)
       │
       ▼
┌─────────────────────┐
│   Supabase          │
│   - site_settings   │
│   - payment_gateways│
│   - products        │
│   - orders          │
│   - order_items     │
│   - order_status_   │
│     events          │
└─────────────────────┘
```

---

## Key Implementation Patterns

### 1. Provider Pattern for Settings

**File**: `context/SiteSettingsContext.tsx`

```typescript
// Centralized settings management
export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState<SiteSettingsRow | null>(null);
  
  const fetchSettings = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", "default")
      .single();
    setSettings(data);
  }, []);

  // Expose refetch for manual updates
  return (
    <SiteSettingsContext.Provider value={{ settings, refetch: fetchSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}
```

**Usage in Components**:
```typescript
const { settings, refetch } = useSiteSettings();
// Use settings.logo_url, settings.delivery_inside_dhaka, etc.
// Call refetch() after updating via API
```

---

### 2. Dynamic Payment Gateways

**Backend**: `app/api/payment-gateways/route.ts`

```typescript
export async function GET() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("payment_gateways")
    .select("gateway, display_name_en, display_name_bn")
    .eq("is_active", true);  // Only active gateways
  
  return NextResponse.json(data);
}
```

**Frontend**: `app/checkout/page.tsx`

```typescript
const [paymentGateways, setPaymentGateways] = useState([]);

useEffect(() => {
  fetch("/api/payment-gateways")
    .then(r => r.json())
    .then(setPaymentGateways);
}, []);

// Dynamically render payment options
{paymentGateways.map(gateway => (
  <PaymentOption key={gateway.gateway} {...gateway} />
))}
```

**Result**: No hardcoded payment methods. Admin controls everything.

---

### 3. Inline Editable Fields

**Example**: Stock Update in Products Table

```typescript
const [editingStock, setEditingStock] = useState<{id: string, value: number} | null>(null);

// Click to edit
<button onClick={() => setEditingStock({id: product.id, value: product.stock})}>
  {product.stock} units
</button>

// Inline input
{editingStock?.id === product.id && (
  <input
    value={editingStock.value}
    onChange={(e) => setEditingStock({id: product.id, value: parseInt(e.target.value)})}
    onKeyDown={(e) => {
      if (e.key === "Enter") updateStock(product.id, editingStock.value);
    }}
  />
)}

// API call
const updateStock = async (id, stock) => {
  await fetch("/api/admin/products/stock", {
    method: "PATCH",
    body: JSON.stringify({ id, stock })
  });
};
```

---

### 4. Order Status Tracking with Events

**API**: `app/api/admin/orders/status/route.ts`

```typescript
export async function PATCH(request: Request) {
  const { orderId, status, note } = await request.json();
  
  const supabase = await createClient();
  
  // Update order status
  await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);
  
  // Create status event (audit trail)
  await supabase
    .from("order_status_events")
    .insert({
      order_id: orderId,
      status,
      provider: "admin",
      payload_summary: note ? { note } : null
    });
  
  return NextResponse.json({ success: true });
}
```

**Benefits**:
- Full audit trail in `order_status_events` table
- Can track who changed status and when
- Can add notes to each status change
- Customer sees real-time updates

---

## Database Schema Details

### site_settings Table

```sql
CREATE TABLE site_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',  -- Single row
  logo_url TEXT,
  site_name_en TEXT NOT NULL,
  delivery_inside_dhaka NUMERIC(10,2) DEFAULT 70,
  delivery_outside_dhaka NUMERIC(10,2) DEFAULT 130,
  primary_color TEXT DEFAULT '#0f172a',
  -- ... other settings
);
```

**Key Points**:
- Single row with `id='default'`
- All settings in one place
- Updated via PATCH `/api/admin/settings`

### payment_gateways Table

```sql
CREATE TABLE payment_gateways (
  id UUID PRIMARY KEY,
  gateway TEXT UNIQUE,  -- cod, bkash, nagad, sslcommerz
  is_active BOOLEAN DEFAULT FALSE,
  display_name_en TEXT,
  credentials_json JSONB  -- Flexible credential storage
);
```

**Credentials JSON Structure**:

```json
// bKash
{
  "app_key": "xxx",
  "app_secret": "xxx",
  "username": "xxx",
  "password": "xxx"
}

// SSLCommerz
{
  "store_id": "xxx",
  "store_password": "xxx",
  "environment": "sandbox" | "live"
}

// Nagad
{
  "merchant_id": "xxx",
  "merchant_number": "xxx",
  "public_key": "-----BEGIN PUBLIC KEY-----...",
  "private_key": "-----BEGIN PRIVATE KEY-----..."
}
```

### order_status_events Table

```sql
CREATE TABLE order_status_events (
  id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  order_id UUID REFERENCES orders(id),
  provider TEXT,  -- 'admin', 'system', 'courier'
  status TEXT,    -- The new status
  payload_summary JSONB  -- Additional data (note, tracking code, etc.)
);
```

**Purpose**: Audit trail for all status changes

---

## API Endpoints Reference

### Admin Settings

#### `GET /api/admin/settings`
Fetch current site settings.

**Response**:
```json
{
  "id": "default",
  "logo_url": "https://...",
  "site_name_en": "City Plus Pet Shop",
  "delivery_inside_dhaka": 70,
  "delivery_outside_dhaka": 130,
  "primary_color": "#0f172a",
  // ... all other settings
}
```

#### `PATCH /api/admin/settings`
Update site settings.

**Request Body**:
```json
{
  "logo_url": "https://new-logo.png",
  "delivery_inside_dhaka": 80,
  "primary_color": "#1e293b"
}
```

**Response**: Updated settings row

---

### Payment Gateways

#### `GET /api/admin/payment-gateways`
Fetch all payment gateways (admin view with credentials).

**Response**:
```json
[
  {
    "id": "uuid",
    "gateway": "cod",
    "is_active": true,
    "display_name_en": "Cash on Delivery",
    "credentials_json": null
  },
  {
    "id": "uuid",
    "gateway": "bkash",
    "is_active": false,
    "display_name_en": "bKash",
    "credentials_json": {
      "app_key": "xxx",
      "app_secret": "xxx"
    }
  }
]
```

#### `PATCH /api/admin/payment-gateways`
Update gateway status or credentials.

**Request Body**:
```json
{
  "id": "uuid",
  "is_active": true,
  "credentials_json": {
    "app_key": "new_key",
    "app_secret": "new_secret"
  }
}
```

#### `GET /api/payment-gateways` (Public)
Fetch only active gateways for checkout.

**Response**:
```json
[
  {
    "gateway": "cod",
    "display_name_en": "Cash on Delivery",
    "display_name_bn": null
  },
  {
    "gateway": "sslcommerz",
    "display_name_en": "Card / Bank",
    "display_name_bn": null
  }
]
```

---

### Products

#### `GET /api/admin/products`
Fetch all products.

#### `POST /api/admin/products`
Create new product.

**Request Body**:
```json
{
  "name_en": "Dog Food - Premium",
  "slug": "dog-food-premium",
  "selling_price": 1200,
  "buying_price": 900,
  "stock": 50,
  "category_slug": "dog-food",
  "images": ["https://..."],
  "is_active": true
}
```

#### `PATCH /api/admin/products`
Update existing product.

**Request Body**:
```json
{
  "id": "uuid",
  "selling_price": 1300,
  "stock": 45
}
```

#### `DELETE /api/admin/products`
Delete product.

**Request Body**:
```json
{
  "id": "uuid"
}
```

#### `PATCH /api/admin/products/stock`
Quick stock update.

**Request Body**:
```json
{
  "id": "uuid",
  "stock": 100
}
```

**Response**:
```json
{
  "id": "uuid",
  "name_en": "Dog Food - Premium",
  "stock": 100
}
```

---

### Orders

#### `PATCH /api/admin/orders/status`
Update order status and create audit event.

**Request Body**:
```json
{
  "orderId": "uuid",
  "status": "shipped",
  "note": "Shipped via Pathao" // Optional
}
```

**Valid Statuses**:
- `pending`
- `processing`
- `shipped`
- `handed_to_courier`
- `delivered`
- `cancelled`
- `returned`
- `refund_requested`
- `refunded`
- `failed`

**Response**: Updated order object

---

## Security Considerations

### 1. RLS Policies

All tables have Row Level Security enabled:

```sql
-- site_settings: Public read
CREATE POLICY "Public read site_settings" 
  ON site_settings FOR SELECT USING (true);

-- payment_gateways: Public read active only
CREATE POLICY "Public read active payment_gateways" 
  ON payment_gateways FOR SELECT USING (is_active = true);

-- products: Public read active only
CREATE POLICY "Public read products" 
  ON products FOR SELECT USING (is_active = true);
```

### 2. Server-Side API Routes

All admin routes use `createClient()` from `@/lib/supabase/server`:

```typescript
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request) {
  const supabase = await createClient();
  // Server-side client bypasses RLS for service_role
  // or uses authenticated user for user-role
}
```

### 3. Credential Storage

Payment credentials stored in JSONB:
- Can be encrypted at application level
- Not exposed to frontend
- Only admin API returns credentials
- Public API returns only active gateway names

**Recommendation**: Encrypt sensitive fields before storing:

```typescript
// Pseudo-code
const encryptedCredentials = encrypt(JSON.stringify(credentials), SECRET_KEY);
await supabase
  .from("payment_gateways")
  .update({ credentials_json: encryptedCredentials });
```

---

## Testing Strategy

### 1. Unit Tests (Recommended)

```typescript
// Test API route
describe("PATCH /api/admin/settings", () => {
  it("should update delivery charges", async () => {
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      body: JSON.stringify({ delivery_inside_dhaka: 80 })
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.delivery_inside_dhaka).toBe(80);
  });
});
```

### 2. Integration Tests

```typescript
// Test full checkout flow
it("should show only active payment gateways", async () => {
  // Enable only COD in DB
  await enableGateway("cod");
  await disableGateway("bkash");
  
  // Fetch public endpoint
  const res = await fetch("/api/payment-gateways");
  const gateways = await res.json();
  
  expect(gateways).toHaveLength(1);
  expect(gateways[0].gateway).toBe("cod");
});
```

### 3. E2E Tests (Playwright)

```typescript
test("admin can update order status", async ({ page }) => {
  await page.goto("/admin/orders");
  await page.selectOption('[data-testid="status-dropdown"]', "shipped");
  await expect(page.locator(".status-badge")).toHaveText("Shipped");
});
```

---

## Performance Optimizations

### 1. Context Caching

```typescript
// SiteSettingsContext caches in state
const [settings, setSettings] = useState<SiteSettingsRow | null>(null);

// Only refetch when explicitly called
const refetch = useCallback(async () => {
  // Fetch from Supabase
}, []);
```

### 2. React Query (Recommended Future Enhancement)

```typescript
import { useQuery, useMutation } from "@tanstack/react-query";

function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: () => fetch("/api/admin/settings").then(r => r.json()),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

function useUpdateSettings() {
  return useMutation({
    mutationFn: (updates) => 
      fetch("/api/admin/settings", {
        method: "PATCH",
        body: JSON.stringify(updates)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["settings"]);
    }
  });
}
```

### 3. Optimistic Updates

```typescript
const updateStatus = async (orderId, newStatus) => {
  // Update UI immediately
  setOrders(prev => 
    prev.map(o => o.id === orderId ? {...o, status: newStatus} : o)
  );
  
  // Then sync with server
  try {
    await fetch("/api/admin/orders/status", {
      method: "PATCH",
      body: JSON.stringify({ orderId, status: newStatus })
    });
  } catch (err) {
    // Revert on error
    fetchOrders();
  }
};
```

---

## Deployment Checklist

### 1. Environment Variables

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

# Optional (for server-side admin operations)
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
```

### 2. Supabase Setup

- ✅ Run all migrations in order (001 to 010)
- ✅ Insert default data:
  - `site_settings` row with id='default'
  - Payment gateways (cod, bkash, nagad, sslcommerz)
- ✅ Configure RLS policies
- ✅ Set up Supabase Storage buckets for product images

### 3. Build & Deploy

```bash
# Build locally to check for errors
npm run build

# Deploy to Vercel
vercel --prod

# Or deploy to your platform
npm run build && npm run start
```

### 4. Post-Deployment

1. Access `/admin/settings` and configure store
2. Enable payment gateways in `/admin/payments`
3. Add products via `/admin/products`
4. Test checkout flow end-to-end
5. Test order status updates

---

## Troubleshooting

### Issue: Payment Gateway Not Showing in Checkout

**Check**:
1. Is `is_active = true` in `payment_gateways` table?
2. Does `/api/payment-gateways` return the gateway?
3. Check browser console for fetch errors

### Issue: Settings Not Saving

**Check**:
1. Browser console for API errors
2. Supabase logs for RLS policy issues
3. Ensure user has write permissions (service_role key for admin routes)

### Issue: Order Status Not Updating

**Check**:
1. Valid status value (see API docs)
2. Order exists in database
3. `order_status_events` table has insert policy

---

## Future Enhancements

### 1. Real-Time Updates

```typescript
// Use Supabase Realtime
const supabase = createClient();

supabase
  .channel("orders")
  .on("postgres_changes", {
    event: "UPDATE",
    schema: "public",
    table: "orders"
  }, (payload) => {
    // Update UI in real-time
    setOrders(prev => 
      prev.map(o => o.id === payload.new.id ? payload.new : o)
    );
  })
  .subscribe();
```

### 2. Image Upload Component

```typescript
// Upload to Supabase Storage
async function uploadLogo(file: File) {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from("logos")
    .upload(`${Date.now()}_${file.name}`, file);
  
  if (data) {
    const url = supabase.storage.from("logos").getPublicUrl(data.path).data.publicUrl;
    // Save to site_settings
    await updateSettings({ logo_url: url });
  }
}
```

### 3. Webhook for Payment Status

```typescript
// POST /api/webhooks/payment
export async function POST(request: Request) {
  const payload = await request.json();
  
  // Verify signature
  if (!verifySignature(payload)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }
  
  // Update order payment status
  const supabase = await createClient();
  await supabase
    .from("orders")
    .update({ payment_status: payload.status })
    .eq("id", payload.order_id);
  
  return NextResponse.json({ success: true });
}
```

---

## Conclusion

This implementation provides a solid foundation for a Zero-Code manageable e-commerce platform. All critical configurations are database-driven, allowing non-technical clients to manage their store independently.

For questions or contributions, refer to the codebase or contact the development team.
