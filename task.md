# Task Checklist

- [x] Identify the "7 problems" reported by the user <!-- id: 0 -->
    - [x] Fix: `useTheme` error in `sonner.tsx` (missing `'use client'`)
    - [x] Fix: Duplicate routes between `src/app` and `src/pages`
- [/] Fix the identified problems <!-- id: 1 -->
    - [ ] Add `'use client'` to `src/components/ui/sonner.tsx`
    - [ ] Move `src/pages` to `src/legacy-pages`
    - [ ] Update imports in `src/app/*/page.tsx`
- [ ] Verify the fixes <!-- id: 2 -->
- [ ] Run the project successfully <!-- id: 3 -->
