# Active Context: SimPal eSIM Marketplace

## Current State

**App Status**: ✅ SimPal — eSIM Travel Data Marketplace with i18n, Auth, Cart, Admin & Affiliate

A full-featured eSIM marketplace built on Next.js 16 with internationalization, user authentication, shopping cart, admin dashboard, and affiliate system.

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
- [x] **Plans Landing Page** - Converted /plans to landing/lobby page:
  - Removed API fetch for plans (optimize RAM and SEO)
  - Search dropdown now navigates to /esim/[slug] using router
  - Region filter bar converted to Link components
  - Display Top Destinations grid (20 countries) as landing content
  - Quick links to regions below destinations
  - Added loading overlay with spinner for navigation feedback
- [x] **Translation files** - Updated all 4 languages (en.json, vi.json, fr.json, de.json) with complete translations and fixed duplicate keys
- [x] **Admin Gift eSIM** - Admin can give free eSIM plans to users via "Give Free Plan" button in orders page (input packageCode)
- [x] **Affiliate System** - Complete affiliate/referral system with:
  - Cookie-based tracking (30 days)
  - Commission rates by rank (Bronze 5%, Silver 8%, Gold 12%, Diamond 15%)
  - Auto-commission on successful orders
  - User affiliate dashboard with referral link, stats, and withdrawal
  - Admin affiliate management (withdrawals, commission rates)
  - Middleware for referral cookie handling
- [x] **SEO-friendly /esim routes** - Removed rewrite rule in next.config.ts, fixed absolute URL fetches:
  - `/esim/[country]/[slug]/page.tsx` - Plan detail with full UI (image, badges, networks, features)
  - `/esim/[country]/page.tsx` - Country listing (client-side fetch with PlanCard)
  - Fixed fetch URLs to use absolute URLs with NEXT_PUBLIC_APP_URL env var
- [x] **Client-side Faceted Filters** - Added filters to `/esim/[country]/page.tsx`:
  - Fetches all data once, filters in-browser (no API calls per filter)
  - Dynamic dropdown options computed from actual data (only shows available durations/data amounts)
  - Combined filtering with useMemo (e.g., select 7 days + 10GB)
  - Clear filter button, results count display
  - **Dependent Faceted Filters**: options auto-update based on selected filter (no empty results)
  - Mobile-optimized: stacked filters, full-width selects on small screens
- [x] **Unsplash Integration** - Added dynamic Unsplash images for destinations and regions:
  - Added Unsplash API integration in `/api/unsplash` route
  - Added `getValidUrl()` function in `src/lib/unsplash.ts` for URL building
  - Updated DEFAULT_DESTINATIONS with photo IDs from Unsplash
  - Updated DEFAULT_REGIONS with landmark photo IDs (Asia: Tokyo, Europe: Paris, Americas: NYC, Middle East: Dubai, Oceania: Sydney)
  - Cards now display high-quality landmark images instead of emoji icons
- [x] **Destination Management System** - Admin can manage top destinations and regions on /plans page:
  - Database models: `Destination` and `DestinationRegion` in prisma schema
  - API `/api/destinations` - Public fetch for visible destinations/regions
  - API `/api/admin/destinations` - Admin CRUD with image upload
  - Image upload converts JPEG/PNG to WebP automatically using sharp
  - Admin page `/admin/destinations` with full UI (show/hide, image, landmark, priority)
  - `/plans` page now fetches from database with fallback to defaults
- [x] **Hot Plans + minPrice** - Added features for /plans page:
  - **minPrice column in Country table** - Auto-calculated during plan sync (lowest retailPriceUsd)
  - **isHot filter in /api/plans** - Added `?isHot=true` parameter to filter hot plans
  - **Hot Plans section on /plans** - Displays plans where isHot=true from database
  - **Price display** - Uses minPrice from Country table for "From $X.XX" display on destination cards
- [x] **Retail Price for TopupPackages** - Updated pricing system:
  - Added `retailPriceRaw` and `retailPriceUsd` columns to TopupPackage in schema
  - Updated sync logic to save retailPrice from Esimaccess API
- [x] **Top-up Order Handling** - Backend now handles "Cumulative" orders with top-up:
  - Added schema fields: `isTopupMode`, `selectedDuration`, `basePlanDays`, `extraDays`, `topupPackageCode` on Order and OrderItem
  - Order API now calculates price server-side: `FinalPrice = BasePlan.Price + (extraDays * TopupRetailPrice)`
  - Post-payment processing: Base eSIM order → Top-up API call with periodNum → Email confirmation
  - Added retry logic with admin alerts on failed top-ups
  - Checkout UI displays base package + extension days breakdown
  - PayPal integration passes top-up metadata through custom_id
  - **Updated price formula**: Price = BasePlan + (SelectedDays - BaseDays) × TopupRetailPrice
  - Updated frontend (EsimDataTypeModal.tsx) and checkout with new formula
  - Updated order API to calculate correct price on server-side

 - [x] **Sync Topup Packages** - Admin can sync top-up packages from eSIM Access:
   - Button "Sync Topup Packages" in admin dashboard with loading state
   - POST /api/admin/plans handler with action 'sync_topup'
   - Deletes all existing TopupPackage records before sync
   - Filters plans with supportTopUpType === 3 (flexible day-based top-up)
   - Fetches topup packages in batches of 10 with 500ms delay to avoid rate limiting
   - Saves each topup package with planId reference and updates Plan.topupPackageId
   - Shows success popup with count of synced packages
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
| `src/app/plans/page.tsx` | Plans browse page with country search & dynamic filters | ✅ Ready |
| `src/app/affiliate/page.tsx` | User affiliate dashboard | ✅ Ready |
| `src/app/admin/affiliate/page.tsx` | Admin affiliate management | ✅ Ready |
| `src/app/api/auth/` | Auth API routes | ✅ Ready |
| `src/app/api/orders/route.ts` | Orders API | ✅ Ready |
| `src/app/api/affiliate/stats/route.ts` | Affiliate stats API | ✅ Ready |
| `src/app/api/affiliate/withdraw/route.ts` | Withdrawal request API | ✅ Ready |
| `src/app/api/admin/affiliate/route.ts` | Admin affiliate API | ✅ Ready |
| `src/app/api/countries/search/route.ts` | Country autocomplete search (max 20) | ✅ Ready |
| `src/app/api/countries/[id]/filters/route.ts` | Country dynamic filters API | ✅ Ready |
| `src/db/schema.ts` | Database schema | ✅ Ready |
| `src/lib/auth.ts` | Auth utilities | ✅ Ready |
| `src/lib/affiliate.ts` | Affiliate logic (commission rates, tracking) | ✅ Ready |
| `src/lib/referral-tracking.ts` | Referral cookie handling | ✅ Ready |
| `src/middleware.ts` | Referral cookie middleware | ✅ Ready |
| `src/components/providers/AuthProvider.tsx` | Auth context | ✅ Ready |
| `src/components/providers/CartProvider.tsx` | Cart context | ✅ Ready |
| `src/components/ui/LanguageSwitcher.tsx` | Language switcher | ✅ Ready |
| `messages/` | Translation files | ✅ Ready |

## Database Schema

- **users**: id, name, email, password, role, createdAt, affiliateCode, affiliateBalance, rank, referredById
- **orders**: id, userId, totalAmount, status, createdAt
- **orderItems**: id, orderId, planId, planName, price, quantity
- **cartItems**: id, userId, planId, planName, price, quantity, createdAt
- **commissions**: id, referrerId, buyerId, orderId, amount, percentage, rank, status, createdAt
- **withdrawals**: id, userId, amount, paymentMethod, paymentDetails, status, createdAt

## Affiliate Commission Rates

| Rank | Commission Rate | Threshold |
|------|-----------------|------------|
| Bronze | 5% | Default |
| Silver | 8% | $50+ earnings |
| Gold | 12% | $200+ earnings |
| Diamond | 15% | $500+ earnings |

## Current Focus

- Run `npx prisma generate` to update Prisma types (done)
- Add real payment integration (Stripe)
- Add email notifications

## Security Fixes Applied (2026-04-10)

- Added admin role verification in `/api/admin/affiliate` route
- Commission creation wrapped in try-catch to not fail order
- Disabled wallet top-up (return 501 - requires payment gateway)
- Added paymentDetails validation in withdrawal API
- Replaced alert() with state-based UI feedback in affiliate page

## Changes (2026-04-11)

- Removed wallet top-up functionality completely
- Wallet balance can only be increased via affiliate commissions
- Updated wallet page to show only affiliate earnings
- Kept withdrawal functionality (PayPal Payouts API pending)

## Changes (2026-04-19)

- **Optimized Sync Process** - Implemented 3 solutions:
  1. **Background Task**: Backend returns immediately with `{status: "started"}` and runs sync in background fire-and-forget pattern
  2. **Promise.all**: Used for parallel DB operations (regions + countries upsert in single Promise.all call)
  3. **Reduced Polling**: Changed from 200ms to 1000ms polling interval in admin dashboard to decrease server load

## Quick Start Guide

### Routes use locale:
- `/en/` - English
- `/vi/` - Vietnamese

### To add a new page:
Create a file at `src/app/[locale]/[route]/page.tsx`

### To add API routes:
Create `src/app/api/[route]/route.ts`

### Referral Link Format:
`?ref=AFFILIATE_CODE` - Cookie tracks for 30 days

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
| 2026-04-05 | Enhanced plans page with search dropdown, dynamic filters, display limit |
| 2026-04-05 | Added country search with autocomplete + dynamic data/duration filters |
| 2026-04-10 | Added complete Affiliate system with cookie tracking, commission by rank, dashboard, withdrawals, admin management |
| 2026-04-13 | Added client-side dependent faceted filters to /esim/[country] + converted /plans to landing page + Unsplash images for destinations and regions |
| 2026-04-21 | Added Sync Topup Packages feature - Admin can sync top-up packages with batching and rate limiting
