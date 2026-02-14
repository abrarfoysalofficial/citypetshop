# 🚀 Quick Start Guide for Client

## Prerequisites
Make sure your Supabase project is set up with all migrations applied.

## 1️⃣ First-Time Setup (5 minutes)

### Step 1: Configure Store Settings
1. Go to **`/admin/settings`** → **Store details** tab
2. Fill in:
   - **Store Logo URL**: Upload logo to Supabase Storage and paste URL
   - **Store Name**: `City Plus Pet Shop` (or your name)
   - **Physical Address**: Your store address
   - **Phone**: Store contact number
   - **Email**: Store email
   - **Delivery Inside Dhaka**: `70` BDT (or your rate)
   - **Delivery Outside Dhaka**: `130` BDT (or your rate)
3. Click **Save changes**

### Step 2: Customize Theme (Optional)
1. Go to **Theme Customizer** tab
2. Adjust colors:
   - **Primary Color**: `#0f172a` (dark slate)
   - **Secondary Color**: `#06b6d4` (cyan)
   - **Accent Color**: `#f97316` (orange)
3. Click **Save Changes**

---

## 2️⃣ Enable Payment Methods

### Go to `/admin/payments`

### For Cash on Delivery (COD):
- Already enabled by default ✅
- Click **Disable** if you want to turn it off temporarily

### For bKash:
1. Click **Enable** on the bKash card
2. Click **Configure Credentials**
3. Enter:
   - **App Key**: From bKash PGW dashboard
   - **App Secret**: From bKash PGW dashboard
   - **Username**: Your bKash merchant username
   - **Password**: Your bKash merchant password
4. Click **Save Credentials**
5. bKash will now appear in checkout!

### For SSLCommerz:
1. Click **Enable** on the SSLCommerz card
2. Click **Configure Credentials**
3. Enter:
   - **Store ID**: From SSLCommerz dashboard
   - **Store Password**: From SSLCommerz dashboard
   - **Environment**: Choose `Sandbox` for testing, `Live` for production
4. Click **Save Credentials**
5. SSLCommerz will now appear in checkout with all payment methods (Cards, bKash, Nagad, Rocket, etc.)

### For Nagad:
1. Click **Enable**
2. Click **Configure Credentials**
3. Enter merchant details from Nagad
4. Click **Save Credentials**

**💡 Tip**: You can enable multiple gateways simultaneously. All active gateways will show in checkout.

---

## 3️⃣ Add Your Products

### Option A: Add Single Product
1. Go to **`/admin/products`**
2. Click **New Product**
3. Fill in product details
4. Click **Save**

### Option B: Bulk Import (Recommended for multiple products)
1. Go to **`/admin/products`**
2. Click **Bulk Add (CSV)**
3. Upload CSV file
4. Products imported automatically

### Update Stock Quantities:
- In the products table, **click any stock value**
- Enter new quantity
- Click **Save** (or press Enter)
- Stock updated instantly! ⚡

---

## 4️⃣ Manage Orders

### View Orders:
1. Go to **`/admin/orders`**
2. See all customer orders
3. Filter by status: Pending, Processing, Shipped, etc.

### Update Order Status:
1. Find the order in the table
2. **Click the status dropdown** in the "Status" column
3. Select new status:
   - **Pending** → Customer just placed order
   - **Processing** → You're preparing the order
   - **Shipped** → Order sent via courier
   - **Handed to Courier** → Given to delivery service
   - **Delivered** → Customer received the order ✅
   - **Cancelled** → Order cancelled
4. Status updates automatically!
5. Customer sees the update when they track their order

---

## 5️⃣ Testing Your Setup

### Test Checkout Flow:
1. Go to your store homepage
2. Add products to cart
3. Go to Checkout
4. **Verify**:
   - ✅ Delivery charges show correctly
   - ✅ Payment methods you enabled are visible
   - ✅ COD, bKash, SSLCommerz appear (based on what you enabled)
5. Place a test order with COD

### Test Order Management:
1. Go to **`/admin/orders`**
2. Find your test order
3. Change status from "Pending" to "Processing"
4. Go to the order tracking page as a customer
5. Verify status shows "Processing"

### Test Invoice Download:
1. Complete a test order
2. On order confirmation page, click **Download Invoice**
3. PDF should download with order details

---

## 📊 Day-to-Day Operations

### Daily Tasks:
- Check **`/admin/orders`** for new orders
- Update order statuses as you process them
- Update stock quantities when products arrive

### Weekly Tasks:
- Add new products if inventory changes
- Check payment gateway transaction status
- Review low-stock products

### Monthly Tasks:
- Review delivery charges and adjust if needed
- Check payment gateway credentials expiry
- Update store information if changed

---

## 🆘 Common Tasks

### Change Delivery Charges:
1. Go to **`/admin/settings`** → **Store details**
2. Update "Delivery Inside Dhaka" or "Delivery Outside Dhaka"
3. Click **Save**
4. New rates apply immediately to all future orders

### Disable a Payment Method:
1. Go to **`/admin/payments`**
2. Click **Disable** on the payment method card
3. It disappears from checkout immediately

### Update Product Stock:
1. Go to **`/admin/products`**
2. Click the stock number (e.g., "50 units")
3. Type new quantity
4. Press Enter or click **Save**

### Mark Order as Delivered:
1. Go to **`/admin/orders`**
2. Find the order
3. Click status dropdown → Select **Delivered**
4. Customer can see delivery confirmation

---

## 🎯 Pro Tips

1. **Keep Stock Updated**: Click stock values inline to update quickly
2. **Enable Multiple Payments**: Customers prefer choices - enable COD + at least one online method
3. **Update Order Status Promptly**: Customers track their orders - keep them informed
4. **Test in Sandbox First**: Use SSLCommerz sandbox mode before going live
5. **Monitor Payment Credentials**: Check if API keys need renewal

---

## 📞 Need Help?

- Check `/admin/settings` for all configuration options
- All changes are saved automatically to the database
- Refresh the storefront to see your changes
- Contact your developer for technical issues with payment gateways

---

**You're all set!** 🎉 Your store is now fully functional and ready to accept orders.
