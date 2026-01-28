# Implementation Plan - Fix Sidebar Visibility & Permissions

The user is seeing an empty sidebar after logging in with Google. This is likely due to stale `localStorage` data or missing permissions on the user object during the session sync.

## Proposed Changes

### [Authentication & Permissions]

#### [MODIFY] [AuthContext.tsx](file:///d:/New%20folder/hireflow-portal/src/context/AuthContext.tsx)
- Improve session sync to always fetch the latest user data (role/permissions) from `UsersContext` even if a user is already set.
- Add structural validation to `localStorage` loading to prevent using old, permission-less user objects.
- Add debug logging to track the sync process.

#### [MODIFY] [Sidebar.tsx](file:///d:/New%20folder/hireflow-portal/src/components/layout/Sidebar.tsx)
- Add a loading state skeleton or "Loading..." text when `status === 'loading'`.
- Fallback to safe defaults if permissions are missing.

## Verification Plan

### Automated Tests
- None available in current environment.

### Manual Verification
1. Login with Google.
2. Verify Sidebar shows all relevant items for the Super Admin role.
3. Navigate to User Management and verify the role matches the expected `super_admin`.
4. Verify console is clean of permission-related errors.
