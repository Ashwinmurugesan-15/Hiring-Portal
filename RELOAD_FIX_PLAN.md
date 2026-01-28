# Implementation Plan: Fix State Reset on Reload

This plan addresses the issue where data and sidebar items disappear after a page reload. It involves persisting the authentication state and ensuring data providers handle initial state correctly.

## Proposed Changes

### [Authentication]

#### [MODIFY] [AuthContext.tsx](file:///d:/New%20folder/hireflow-portal/src/context/AuthContext.tsx)
- Add `useEffect` to persist `user` to `localStorage` on change.
- Add `useEffect` on mount to restore `user` from `localStorage`.
- Provide a default `super_admin` user if no user is found in `localStorage` (to facilitate development/demo).

### [Recruitment Context]

#### [MODIFY] [RecruitmentContext.tsx](file:///d:/New%20folder/hireflow-portal/src/context/RecruitmentContext.tsx)
- Add logging to `fetchData` to verify API responses.
- Ensure `candidates` and `interviews` are correctly mapped and set.
- Add a fallback to `mockData` if API fails (optional but safe).

## Verification Plan

### Manual Verification
1.  **Sidebar Persistence**: Log in, refresh the page, and verify that the sidebar items still appear.
2.  **Data Persistence**: Navigate to Interviews/Candidates, refresh, and verify that the data list is populated after a short loading period.
3.  **User Initial**: Verify the user initial in the sidebar matches the logged-in user after refresh.
