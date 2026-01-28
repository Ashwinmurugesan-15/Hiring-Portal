# Implementation Plan: Fix Candidate Data and Filtering Mismatches

This plan addresses several inconsistencies in how candidates are associated with job positions (demands) and how they are filtered in the UI.

## Problem Summary
1.  **Demand ID Mismatch**: The "Add Candidate" dialog uses string-based IDs (e.g., `"sre"`), while the mock data and existing logic use numeric IDs (`"1"`, `"2"`, etc.).
2.  **Filter Failure**: The position filter becomes `"Unknown"` when navigating with a string-based `demandId` because `getDemandTitle` only checks `mockDemands`.
3.  **Confusing Status Filter**: Selecting "All" statuses hides rejected candidates by default, which is counter-intuitive.
4.  **Incomplete Sync**: Application status is not automatically updated to "Rejected" when a "Reject" recommendation is submitted in feedback.

## Proposed Changes

### [Candidate Data & Logic]

#### [MODIFY] [mockData.ts](file:///d:/New%20folder/hireflow-portal/src/data/mockData.ts)
- Update `mockDemands` to use descriptive string IDs (e.g., `id: 'senior-devops'` instead of `id: '1'`).
- Update `mockCandidates` and `mockInterviews` to use these new IDs.

#### [MODIFY] [Candidates.tsx](file:///d:/New%20folder/hireflow-portal/src/legacy-pages/Candidates.tsx)
- Update `getDemandTitle` to use a unified mapping or a more resilient lookup that handles both `mockDemands` and a fallback title map.
- Refactor `filteredCandidates` to show all candidates when status is "all", or rename the "All" option to "Active Applications".
- Ensure `position` filter handles string IDs correctly.

### [Components]

#### [MODIFY] [CandidateTable.tsx](file:///d:/New%20folder/hireflow-portal/src/components/candidates/CandidateTable.tsx)
- Align `positionTitleMap` with the new string IDs used in `mockDemands`.

## Verification Plan

### Automated Tests
- Run `npm run test` (Vitest) to ensure no regressions in candidate filtering logic.
- Run `npx tsc --noEmit` to verify type safety.

### Manual Verification
1.  **Add Candidate**: Verify the new candidate appears with the correct "Interested Position".
2.  **Filter Check**: Navigate to `/candidates?demandId=sre` and verify the filter is correctly applied.
3.  **Status Sync**: Submit a "Reject" recommendation and verify the candidate status changes to "Rejected".
