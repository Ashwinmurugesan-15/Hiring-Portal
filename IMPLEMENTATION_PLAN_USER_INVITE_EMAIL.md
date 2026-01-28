# Implementation Plan - User Addition Email Invitation

The goal is to automatically send an invitation email to new users when they are added to the system.

## Proposed Changes

### [Authentication & Users]

#### [MODIFY] [UsersContext.tsx](file:///d:/New%20folder/hireflow-portal/src/context/UsersContext.tsx)
- Add a `sendInviteEmail` helper function that calls the `/api/email/send` endpoint.
- This function will take the user object and send a welcome email with instructions to log in via Google OAuth.

### [UI Components]

#### [MODIFY] [UserManagement.tsx](file:///d:/New%20folder/hireflow-portal/src/legacy-pages/UserManagement.tsx)
- Update `handleCreateUser` to call `sendInviteEmail` after successfully adding a user.
- Update `handleSendInvite` to actually send an email instead of just showing a toast.

## Email Template

**Subject**: Welcome to HireFlow - [Role] Invitation

**Body**:
Hello [Name],

Welcome to HireFlow! You have been added as an **[Role]** by the Super Admin.

You can now access the portal by signing in with your Google account:
[NEXTAUTH_URL]/login

Best regards,
HireFlow Team

## Verification Plan

### Manual Verification
1.  **Add User**: Add a new user with a valid email in the User Management page.
2.  **Verify Toast**: Ensure a toast confirms the email has been sent.
3.  **Check Logs**: Verify the console logs show the mock email or the real email being sent.
4.  **Resend Invite**: Click the mail icon for an existing user and verify the invitation is resent.
