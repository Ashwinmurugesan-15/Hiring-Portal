# Deploy to Cloudflare Pages

Since I cannot access your Cloudflare dashboard directly, please follow these steps to host your project:

## 1. Push Changes to GitHub
I have already pushed your latest code to GitHub. Ensure your repository is up to date:
```bash
git push origin main
```

## 2. Connect to Cloudflare Pages
1.  Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2.  Go to **Workers & Pages** > **Create Application** > **Pages** > **Connect to Git**.
3.  Select your repository: `Ashwinmurugesan-15/Hiring-Portal`.
4.  **Configure the build settings**:
    - **Framework Preset**: `Next.js`
    - **Build Command**: `npx @cloudflare/next-on-pages`
    - **Output Directory**: `.vercel/output/static`
    - **Node Version**: Set to `20` (add environment variable `NODE_VERSION` = `20` if needed).

## 3. Environment Variables
In the Cloudflare dashboard (Settings > Environment Variables), add the following from your `.env`:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (Set this to your Cloudflare Pages URL, e.g., `https://hiring-portal.pages.dev`)

## 4. Deploy
Click **Save and Deploy**. Cloudflare will build your site and provide a URL.

**Note**: Since we are using NextAuth with the Edge runtime (required for Cloudflare), verify that all your API routes are compatible (using `export const runtime = 'edge'` where possible, though `next-on-pages` handles most compatibility).
