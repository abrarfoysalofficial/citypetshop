# City Plus Pet Shop

A multi-page e-commerce website for **City Plus Pet Shop** built with Next.js 14 (App Router), Tailwind CSS, and Lucide React.

## Design Theme

- **Primary:** Deep Navy Blue (`#1e3a8a`)
- **Secondary:** Cyan / Light Blue (`#06b6d4`)
- Style: Playful, trustworthy, clean, mobile-responsive

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Logo (required for navbar)**

   Copy the logo into the `public` folder so it appears in the header:

   - Copy `logonobg.png` from the project root into `public/logonobg.png`

   On Windows (PowerShell), from the project root:

   ```powershell
   Copy-Item logonobg.png public\logonobg.png
   ```

3. **Run the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Admin Panel

- **Admin** (`/admin`) – Dashboard, Products, Orders, Payments, Checkout Settings, Store Settings, Analytics
- **Admin Login** (`/admin/login`) – Supabase Auth, team_members authorization
- Full feature requirements: [docs/ADMIN_FEATURE_REQUIREMENTS.md](docs/ADMIN_FEATURE_REQUIREMENTS.md)

## Pages & Features

- **Home** (`/`) – Hero, category cards (Food, Accessories, Toys, Medicine), featured products
- **Shop** (`/shop`) – Full product grid with sidebar filters (Category, Price range)
- **Product** (`/product/[id]`) – Product details, quantity selector, Add to Cart
- **Cart** – Slide-over from navbar + full page at `/cart` with items and total
- **Services** (`/services`) – Service offerings
- **Contact** (`/contact`) – Address, hours, contact form

Cart state is managed with React Context and persists while navigating. Mock product data uses Unsplash images.

## Tech Stack

- Next.js 14 (App Router)
- Tailwind CSS
- Lucide React (icons)
- TypeScript

## Build

```bash
npm run build
npm start
```
