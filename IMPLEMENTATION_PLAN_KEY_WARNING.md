# Implementation Plan: Fix React Key Warning in Dashboard

The user reported a "unique key prop" warning in the Dashboard. This is typically caused by missing or duplicate keys in a list of elements rendered via `.map()`.

## Proposed Changes

### [Dashboard]

#### [MODIFY] [Dashboard.tsx](file:///d:/New%20folder/hireflow-portal/src/legacy-pages/Dashboard.tsx)
- Update all `.map()` calls to use a robust key (e.g., combining `id` with an index fallback).
- Places to update:
    - Interviewer view: Scheduled interviews map (Line 220)
    - Hiring Manager view: Active demands map (Line 343)
    - Hiring Manager view: Demand Summary table rows (Line 380)
    - Admin/Super Admin view: Active demands map (Line 562)

## Verification Plan

### Manual Verification
1. Log in as different roles (Super Admin, Hiring Manager, Interviewer).
2. Open the browser console and check for "Each child in a list should have a unique 'key' prop" warnings in the Dashboard.
3. Verify that the warning no longer appears.
