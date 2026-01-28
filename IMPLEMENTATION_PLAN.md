# Fix Build and Runtime Errors

The project suffers from two main issues:
1.  **Runtime Error**: `src/components/ui/sonner.tsx` uses `useTheme` but lacks the `'use client'` directive, causing it to fail when rendered as part of a layout.
2.  **Build Error**: Conflict between `src/app` (App Router) and `src/pages` (Pages Router). The pages in `src/pages` fail because they expect context providers that only exist in the App Router's `layout.tsx`.

## Proposed Changes

### [Fixes]

#### [MODIFY] [sonner.tsx](file:///d:/New%20folder/hireflow-portal/src/components/ui/sonner.tsx)
Add `'use client'` at the top.

#### [MOVE] [src/pages](file:///d:/New%20folder/hireflow-portal/src/pages) to [src/legacy-pages](file:///d:/New%20folder/hireflow-portal/src/legacy-pages)
Prevent Next.js from routing to these files.

#### [MODIFY] [src/app/*/page.tsx](file:///d:/New%20folder/hireflow-portal/src/app)
Update imports from `@/pages/*` to `@/legacy-pages/*`.

## Verification Plan

### Automated Tests
- Run `npm run build`
- Run `npx tsc --noEmit`

### Manual Verification
- Verify the app renders without the `useTheme` error.
- Verify navigation to all pages works.
