# Walkthrough - Email Functionality

I have implemented a backend email service using **Nodemailer** to allow the application to send real emails.

## Features Added

### 1. Backend Email Infrastructure
- **Utility**: Created `src/lib/mail.ts` which configures the `nodemailer` transporter (using Gmail service by default).
- **API Route**: Created `/api/email/send` which accepts POST requests to send emails.
- **Environment Support**: It looks for `EMAIL_USER` and `EMAIL_PASS` in environment variables. If missing, it logs the email to the console (perfect for development).

### 2. Frontend Integration
- **Context**: Updated `RecruitmentContext` to include a `sendEmail` function.
- **Rejection Dialog**: The "Reject & Send Email" button in the rejection dialog now triggers the actual email sending process.
- **Schedule Interview**: The "Schedule & Send Email" button now sends a calendar invite email.
- **Create Demand**: Admins are automatically notified via email when a new job demand is created.
- **Interview Reminders**: The "Send Reminder" button in the Interviews page now sends a reminder email.
- **Feedback**: Displays a toaster notification upon success or failure.

## How to Test

1.  **Console Logging (Default)**:
    - Open the browser developer tools (or server terminal).
    - Reject a candidate.
    - Observe the "Mock Email" log in the server console showing the recipient, subject, and body.

2.  **Real Emails**:
    - Create a `.env.local` file in the root.
    - Add:
      ```env
      EMAIL_USER=your-email@gmail.com
      EMAIL_PASS=your-app-password
      ```
    - Restart the server (`npm run dev`).
    - Sending an email will now dispatch a real email.

## Verification
- Ran `npx tsc` to ensure type safety.
- Verified that the UI handles the loading state ("Sending...") correctly.
