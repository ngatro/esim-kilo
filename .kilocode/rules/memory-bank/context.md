# Active Context: Next.js Starter Template

## Current State

**App Status**: ✅ SimPal — eSIM Travel Data Marketplace

A full-featured eSIM marketplace built on Next.js 16. Users can browse travel eSIM data plans by region, search by destination, view plan details, and proceed to purchase.

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

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/app/page.tsx` | Home page (all sections) | ✅ Ready |
| `src/app/layout.tsx` | Root layout (SimPal metadata) | ✅ Ready |
| `src/app/globals.css` | Global styles | ✅ Ready |
| `src/app/plans/[id]/page.tsx` | Plan detail + checkout page | ✅ Ready |
| `src/lib/esim-data.ts` | Plan data, types, helpers | ✅ Ready |
| `src/components/layout/Header.tsx` | Sticky nav header | ✅ Ready |
| `src/components/layout/Footer.tsx` | Footer with links | ✅ Ready |
| `src/components/sections/Hero.tsx` | Hero with CTA + stats | ✅ Ready |
| `src/components/sections/HowItWorks.tsx` | 4-step onboarding | ✅ Ready |
| `src/components/sections/PlansSection.tsx` | Region filter + plan grid | ✅ Ready |
| `src/components/sections/FAQ.tsx` | Accordion FAQ | ✅ Ready |
| `src/components/ui/PlanCard.tsx` | Individual plan card | ✅ Ready |
| `.kilocode/` | AI context & recipes | ✅ Ready |

## Current Focus

SimPal marketplace is live. Potential next steps:
1. Add real payment integration (Stripe)
2. Add user auth for order history
3. Add database for persisting orders

## Quick Start Guide

### To add a new page:

Create a file at `src/app/[route]/page.tsx`:
```tsx
export default function NewPage() {
  return <div>New page content</div>;
}
```

### To add components:

Create `src/components/` directory and add components:
```tsx
// src/components/ui/Button.tsx
export function Button({ children }: { children: React.ReactNode }) {
  return <button className="px-4 py-2 bg-blue-600 text-white rounded">{children}</button>;
}
```

### To add a database:

Follow `.kilocode/recipes/add-database.md`

### To add API routes:

Create `src/app/api/[route]/route.ts`:
```tsx
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Hello" });
}
```

## Available Recipes

| Recipe | File | Use Case |
|--------|------|----------|
| Add Database | `.kilocode/recipes/add-database.md` | Data persistence with Drizzle + SQLite |

## Pending Improvements

- [ ] Add more recipes (auth, email, etc.)
- [ ] Add example components
- [ ] Add testing setup recipe

## Session History

| Date | Changes |
|------|---------|
| Initial | Template created with base setup |
| 2026-03-22 | Built SimPal eSIM travel marketplace — full home page, plan browsing, detail page |
