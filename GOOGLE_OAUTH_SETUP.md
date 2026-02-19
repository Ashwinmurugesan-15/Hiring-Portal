# Google OAuth Configuration Guide

Based on your screenshot, here is exactly what you need to do:

## Step 1: Configure OAuth Platform
1. In your [Google Cloud Console](https://console.cloud.google.com/), click the blue **"Get started"** button in the middle of the screen.
2. **App Information**:
   - App name: `HireFlow Portal`
   - User support email: Choose your email.
3. **Audience**:
   - Choose **External** (this allows you to test with any Google account).
4. **Contact Information**:
   - Developer contact info: Enter your email again.
5. Click **"Save and Continue"** through the Scopes and Summary pages.

## Step 2: Add Test Users
> [!IMPORTANT]
> Since the app is in "Testing" mode, only users you add here can log in.
1. Click **Audience** (or "OAuth consent screen" in the left sidebar).
2. Look for the **Test users** section.
3. Click **"+ Add Users"** and add the Gmail addresses you want to test with.

## Step 3: Create Credentials
1. Click **Clients** (or "Credentials") in the left sidebar.
2. Click **"+ Create Credentials"** at the top.
3. Select **OAuth client ID**.
4. Application type: **Web application**.
5. Name: `HireFlow Web Client`.
6. **Authorized redirect URIs**:
   - Click "+ Add URI" and enter: `http://localhost:3000/api/auth/callback/google`
7. Click **Create**.

## Step 4: Update .env
Copy the **Client ID** and **Client Secret** into your `.env` file:

```env
GOOGLE_CLIENT_ID=your_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_secret_here

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=hireflow-portal-secret-2026
```

## Step 5: Restart
Restart your dev server:
1. Press `Ctrl+C` in your terminal.
2. Run `npm run dev`.
