# BPG Marketplace, powered by REKA

Production-ready MVP scaffold for a Southern African marketplace. Verified sellers upload products, admins approve sellers and products, customers shop, checkout with mock payment, and orders move through fulfilment states.

## Stack

- Next.js 16 App Router, TypeScript, Tailwind CSS
- Next.js server actions and route handlers for the MVP backend
- PostgreSQL with Prisma ORM
- Auth.js / NextAuth credentials auth with customer, seller, and admin roles
- Mock payment provider structured around a `Payment` model so PayFast, Yoco, or Ozow can be added later
- Vercel-ready modular monolith

## Quick Start

```bash
cp .env.example .env
npm install
npx prisma migrate dev
npm run prisma:seed
npm run dev
```

Open `http://localhost:3000`.

Seed credentials:

- Admin: `admin@bpgmarketplace.co.za` / `password123`
- Seller: `seller@example.com` / `password123`
- Customer: `customer@example.com` / `password123`

## Required Environment

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/reka_marketplace?schema=public"
AUTH_SECRET="replace-with-a-long-random-secret"
AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="BPG Marketplace"
```

For production, set the same variables in Vercel and use a managed PostgreSQL provider.

## Core Flows

- Customer registration and login
- Seller application at `/seller/apply`
- Admin seller approval at `/admin/sellers`
- Seller dashboard, product submission, inventory overview, and order fulfilment
- Admin product approval workflow before products appear publicly
- Product browse, search, filters, detail pages, cart, checkout, and order tracking
- Mock payment confirmation creates a `Payment` record with provider `MOCK`
- Delivery is represented as a courier partner placeholder
- Platform commission is stored per order as `commissionTotal`

## Business Rules Implemented

- Products are visible only when `Product.status = APPROVED`
- Sellers can submit products only after approval
- Sellers own stock; checkout decrements product inventory
- Admin can approve or reject sellers and products
- Orders support: `PendingPayment`, `Paid`, `SellerConfirmed`, `Packed`, `CollectedByCourier`, `InTransit`, `Delivered`, `Cancelled`, `Refunded`
- Cross-border readiness is modeled through `Country` and `ProductAvailability`

## Important Paths

- `/`
- `/products`
- `/products/[id]`
- `/cart`
- `/checkout`
- `/orders`
- `/orders/[id]`
- `/seller/apply`
- `/seller/dashboard`
- `/seller/products`
- `/seller/orders`
- `/admin/dashboard`
- `/admin/sellers`
- `/admin/products`
- `/admin/orders`

## Payment Provider Extension

The checkout action currently creates confirmed `MOCK` payments. To add PayFast, Yoco, or Ozow:

1. Add a provider adapter in `src/lib/payments`.
2. Create pending `Payment` records before redirecting to the provider.
3. Add webhook route handlers under `src/app/api/payments/[provider]`.
4. Confirm payment status and advance orders to `Paid` from the webhook.

## Notes

Image upload is implemented as image URL submission in the MVP. In production, replace this with Vercel Blob, S3, Cloudinary, or another object storage provider and keep the existing `ProductImage` model.

