# Active Context: SimPal eSIM Marketplace

## Current State

**App Status**: ✅ SimPal — eSIM Travel Data Marketplace with i18n, Auth, Cart & Admin

A full-featured eSIM marketplace built on Next.js 16 with internationalization, user authentication, shopping cart, and admin dashboard.

## Recently Completed

- [x] Base Next.js 16 setup with App Router
- [x] TypeScript configuration with strict mode
- [x] Tailwind CSS 4 integration
- [x] ESLint configuration
- [x] Memory bank documentation
- [x] Recipe system for common features
- [x] eSIM plan data + types (`src/lib/esim-data.ts`) — 16 plans, 7 regions
- [x] Header + Footer layout components
- [x] Hero section with stats
- [x] HowItWorks section (4-step process)
- [x] PlansSection with interactive region filter + destination search
- [x] PlanCard UI component
- [x] FAQ accordion section
- [x] Plan detail page at `/plans/[id]` with sticky checkout card
- [x] CTA banner on home page
- [x] **i18n support** - English & Vietnamese with next-intl
- [x] **User authentication** - Login/Register with bcrypt password hashing
- [x] **Database** - Drizzle ORM with SQLite (users, orders, cart items)
- [x] **Shopping cart** - Add/remove items, quantity management
- [x] **Checkout** - Order creation flow
- [x] **User orders** - View order history
- [x] **Admin dashboard** - Plan management page

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/app/[locale]/page.tsx` | Home page (all sections) | ✅ Ready |
| `src/app/[locale]/login/page.tsx` | Login page | ✅ Ready |
| `src/app/[locale]/register/page.tsx` | Registration page | ✅ Ready |
| `src/app/[locale]/cart/page.tsx` | Shopping cart page | ✅ Ready |
| `src/app/[locale]/checkout/page.tsx` | Checkout page | ✅ Ready |
| `src/app/[locale]/orders/page.tsx` | User orders page | ✅ Ready |
| `src/app/[locale]/admin/page.tsx` | Admin dashboard | ✅ Ready |
| `src/app/[locale]/admin/plans/page.tsx` | Admin plan management | ✅ Ready |
| `src/app/api/auth/` | Auth API routes | ✅ Ready |
| `src/app/api/orders/route.ts` | Orders API | ✅ Ready |
| `src/db/schema.ts` | Database schema | ✅ Ready |
| `src/lib/auth.ts` | Auth utilities | ✅ Ready |
| `src/components/providers/AuthProvider.tsx` | Auth context | ✅ Ready |
| `src/components/providers/CartProvider.tsx` | Cart context | ✅ Ready |
| `src/components/ui/LanguageSwitcher.tsx` | Language switcher | ✅ Ready |
| `messages/` | Translation files | ✅ Ready |

## Database Schema

- **users**: id, name, email, password, role, createdAt
- **orders**: id, userId, totalAmount, status, createdAt
- **orderItems**: id, orderId, planId, planName, price, quantity
- **cartItems**: id, userId, planId, planName, price, quantity, createdAt

## Current Focus

- Add real payment integration (Stripe)
- Add email notifications

## Quick Start Guide

### Routes use locale:
- `/en/` - English
- `/vi/` - Vietnamese

### To add a new page:
Create a file at `src/app/[locale]/[route]/page.tsx`

### To add API routes:
Create `src/app/api/[route]/route.ts`

## Available Recipes

| Recipe | File | Use Case |
|--------|------|----------|
| Add Database | `.kilocode/recipes/add-database.md` | Data persistence with Drizzle + SQLite |

## Session History

| Date | Changes |
|------|---------|
| Initial | Template created with base setup |
| 2026-03-22 | Built SimPal eSIM travel marketplace |
| 2026-03-22 | Added i18n (English/Vietnamese), auth, cart, admin dashboard |
