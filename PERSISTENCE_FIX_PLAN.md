# Implementation Plan: Fix Data Persistence and Unified IDs

This plan addresses data loss on page reload by ensuring all state updates in `RecruitmentContext.tsx` are persisted to the backend `db.json` via API calls. It also completes the migration to descriptive string IDs in the database.

## Problem Summary
1.  **Incomplete API Sync**: Functions like `updateCandidateFeedback`, `saveScreeningFeedback`, and `updateInterview` only update local state.
2.  **ID Mismatch**: `db.json` still uses numeric IDs ("1", "2"), but the frontend logic now expects descriptive string IDs ("senior-devops", "sre").

## Proposed Changes

### [Database]

#### [MODIFY] [db.json](file:///d:/New%20folder/hireflow-portal/src/data/db.json)
- Update all `demandId` fields and `id` fields in `demands` to use descriptive strings (e.g., `id: "senior-devops"`).

### [Context & API Sync]

#### [MODIFY] [RecruitmentContext.tsx](file:///d:/New%20folder/hireflow-portal/src/context/RecruitmentContext.tsx)
- Update `updateCandidateFeedback` to call `PATCH /api/candidates/update`.
- Update `saveScreeningFeedback` to call `PATCH /api/candidates/update`.
- Update `updateInterview` to call `PATCH /api/interviews`.
- Ensure all other update functions (like `updateCandidateOfferDetails`) also persist changes.

## Verification Plan

### Automated Tests
- Run `npx tsc --noEmit` to verify type safety.

### Manual Verification
1.  **Save Feedback**: Open a candidate's screening feedback, save it, and reload the page. Verify the feedback is still there.
2.  **Update Candidate**: Change a candidate's status or offer details, reload, and verify the persistence.
3.  **Interview Update**: Update an interview round or status, reload, and verify.
