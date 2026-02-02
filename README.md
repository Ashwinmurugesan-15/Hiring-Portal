# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

# HireFlow Portal

A modern recruitment management portal built with Next.js, React, Tailwind CSS, and Shadcn UI.

## Getting Started

### Prerequisites

- **Node.js**: Version 18.17 or later (Recommended: LTS)
- **npm**: Comes with Node.js

### Installation

1.  **Clone the repository** (if you haven't already).
2.  **Install dependencies**:
    ```bash
    npm install
    # or
    npm install --legacy-peer-deps
    ```
    *(Note: Use `--legacy-peer-deps` if you encounter dependency conflicts).*

### Configuration

1.  Create a `.env` file in the root directory (based on `.env.example`).
2.  Add your own credentials:
    ```env
    # Google OAuth (for Login)
    GOOGLE_CLIENT_ID=your_client_id
    GOOGLE_CLIENT_SECRET=your_client_secret

    # NextAuth
    NEXTAUTH_SECRET=your_secret_key
    NEXTAUTH_URL=http://localhost:3000

    # Email (for Notifications)
    EMAIL_USER=your_email@gmail.com
    EMAIL_PASS=your_app_password
    ```

### Running Development Server

To start the local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

To create an optimized production build:

```bash
npm run build
```

Then start the production server:

```bash
npm start
```

## Features
- **Dashboard**: Overview of recruitment demands, stats, and upcoming interviews.
- **Candidates**: Manage candidate profiles, status, and filtering.
- **Interviews**: Schedule and view interview details.
- **Role-based Access**: Different views for Interviewers, Hiring Managers, and Admins.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
