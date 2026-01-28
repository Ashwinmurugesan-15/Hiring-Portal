# Implementation Plan: Restrict Login to Google OAuth & Pre-defined Users

The goal is to simplify the login page by removing the email/password form and role selection, leaving only the "Sign in with Google" button. Additionally, the system should only allow sign-ins from Google accounts already registered in the system.

## Proposed Changes

### [Authentication Layer]

#### [MODIFY] [AuthContext.tsx](file:///d:/New%20folder/hireflow-portal/src/context/AuthContext.tsx)
- Update the session synchronization logic.
- If a Google session is authenticated but the email is not found in the local users list, **don't log them in** and potentially show an error.
- Remove the "default to super_admin for demo" logic.
- Ensure the app doesn't automatically log in a default user if no one is authenticated.

### [UI Components]

#### [MODIFY] [Login.tsx](file:///d:/New%20folder/hireflow-portal/src/legacy-pages/Login.tsx)
- Remove the `roles` selection.
- Remove the `email` and `password` input fields.
- Remove the "Sign In" (manual) button.
- Remove the "Or continue with" divider.
- Keep only the "Sign in with Google" button as the primary action.
- Remove "Demo mode" hints.
- Add a clear message that only authorized users can sign in.

## Verification Plan

### Manual Verification
1. Open the login page. Verify that only the "Sign in with Google" button is visible.
2. Attempt to sign in with an unauthorized Google account. Verify that the login is rejected.
3. Attempt to sign in with an authorized Google account. Verify that the dashboard opens correctly.
