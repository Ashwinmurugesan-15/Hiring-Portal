# Implementation Plan - Email Functionality

The goal is to implement a working email system for the application to send rejection emails, interview invites, and offer letters.

## Prerequisites
- **Nodemailer**: We will use `nodemailer` as the library to send emails via SMTP (Gmail, Outlook, etc.).
- **SMTP Credentials**: You will need an email account to send from (e.g., `ashlog559@gmail.com`) and an [App Password](https://support.google.com/accounts/answer/185833).

## Proposed Changes

### [Dependencies]
- Install `nodemailer`: `npm install nodemailer`
- Install types: `npm install --save-dev @types/nodemailer`

### [Backend / API]

#### [NEW] [src/lib/mail.ts](file:///d:/New%20folder/hireflow-portal/src/lib/mail.ts)
- Create a reusable transporter using `nodemailer`.
- Read credentials from environment variables (`EMAIL_USER`, `EMAIL_PASS`).

#### [NEW] [src/app/api/email/send/route.ts](file:///d:/New%20folder/hireflow-portal/src/app/api/email/send/route.ts)
- Create a `POST` API route that accepts:
  - `to`: Recipient email
  - `subject`: Email subject
  - `html`: Email body (HTML format)
- Uses the `mail.ts` utility to send the email.
- Returns success/failure response.

### [Frontend Integration]

#### [MODIFY] [RecruitmentContext.tsx](file:///d:/New%20folder/hireflow-portal/src/context/RecruitmentContext.tsx)
- Add a `sendEmail` function to the context.
- This function will make a `POST` request to `/api/email/send`.

#### [MODIFY] [RejectionEmailDialog.tsx](file:///d:/New%20folder/hireflow-portal/src/components/dialogs/RejectionEmailDialog.tsx)
- Update the "Send Rejection Email" button to call `sendEmail` from the context instead of just closing the dialog.

## Verification Plan

### Manual Verification
1.  **Configuration**: I will set up the code to look for environment variables. You will need to provide them (or I can hardcode a placeholder for testing if you wish, though mostly safe to use App Passwords).
2.  **Test Action**: Open a candidate, click "Reject", and confirm sending the email.
3.  **Logs**: Check server console logs to see if the email was "sent" (or actually check the inbox if real credentials are used).
