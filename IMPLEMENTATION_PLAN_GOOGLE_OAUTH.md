# Implementation Plan: Google OAuth Integration

Integrate Google OAuth using `next-auth` to allow users to sign in with their Google accounts.

## Proposed Changes

### [Authentication Layer]

#### [NEW] [route.ts](file:///d:/New%20folder/hireflow-portal/src/app/api/auth/[...nextauth]/route.ts)
- Implement `NextAuth` handler with `GoogleProvider`.
- Configure callbacks to map Google user data to internal roles.

#### [MODIFY] [AuthContext.tsx](file:///d:/New%20folder/hireflow-portal/src/context/AuthContext.tsx)
- Integrate `useSession` from `next-auth/react`.
- Update `switchRole` and `logout` to handle session states.

#### [MODIFY] [layout.tsx](file:///d:/New%20folder/hireflow-portal/src/app/layout.tsx)
- Wrap the application in `SessionProvider`.

### [Components]

#### [MODIFY] [Login.tsx](file:///d:/New%20folder/hireflow-portal/src/legacy-pages/Login.tsx)
- Add "Sign in with Google" button.
- Handle OAuth callback and role mapping.

## Setup Requirements

> [!IMPORTANT]
> The user must provide the following environment variables in `.env.local`:
> - `GOOGLE_CLIENT_ID`
> - `GOOGLE_CLIENT_SECRET`
> - `NEXTAUTH_SECRET`
> - `NEXTAUTH_URL`

## Verification Plan

### Manual Verification
1. Click "Sign in with Google" on the login page.
2. Complete the Google OAuth flow.
3. Verify redirection to the dashboard and correct role assignment.
