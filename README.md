This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Registration Database and Admin

Race registrations are stored in Neon Postgres through `DATABASE_URL`. The public registration route creates or updates a pending registration, stores the Stripe Checkout session ID, and the Stripe webhook marks the matching session as paid after signature verification.

Required Vercel environment variables:

```bash
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
ADMIN_PASSWORD=use-a-long-random-password
ADMIN_SESSION_SECRET=use-another-long-random-string
REGISTRATION_FEE_CENTS=5000
NEXT_PUBLIC_URL=https://oetz-trophy.vercel.app
```

Admin tools:

- `/admin` opens the password-protected registration dashboard.
- `/api/admin/export` downloads registrations as CSV for authenticated admins.
- The dashboard lets admins filter registrations, change status, add internal notes, mark check-in, and export the filtered list.
