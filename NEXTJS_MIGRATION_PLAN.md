# Next.js Backend Migration Plan

Migrate the current Vite-based React application to a Next.js full-stack application. This will provide a robust backend with API routes and a modern frontend framework.

## Proposed Strategy

### 1. Project Initialization
- Install Next.js dependencies (`next`, `react`, `react-dom`).
- Create `next.config.mjs`, `tsconfig.json`, and other configuration files.
- Set up the App Router directory structure (`app/`).

### 2. Frontend Migration
- **Layout**: Move `DashboardLayout` logic to a Next.js root layout.
- **Pages**: Convert Vite pages (in `src/pages`) to Next.js routes (e.g., `app/dashboard/page.tsx`).
- **Components**: Most components in `src/components` can stay as is (some might need `'use client'`).
- **Routing**: Replace `react-router-dom` with `next/navigation` and `next/link`.

### 3. Backend Implementation (Next.js API Routes)
- **API Routes**: Create endpoints in `app/api/`:
  - `/api/candidates`: GET (all), POST (add), PATCH (update).
  - `/api/demands`: GET (all), POST (add), PATCH (update).
  - `/api/interviews`: GET (all), POST (add), PATCH (update).
- **Data Store**: Implement a simple file-based JSON database (e.g., `data/db.json`) to persist changes across sessions.

### 4. Data Integration
- Update `RecruitmentContext` and `DemandsContext` to perform `fetch` requests to the new API routes.
- Replace direct imports of `src/data/mockData.ts` with API calls.

## Verification Plan

### Manual Verification
1. Run `npm run dev` (after migrating).
2. Verify all dashboard stats are populated via API calls.
3. Test adding/editing a candidate and verify the JSON database updates.
4. Test report downloads and ensure data is fetched correctly.
