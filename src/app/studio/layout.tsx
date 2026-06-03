import type { ReactNode } from 'react';

// The Studio lives outside the [locale] segment, so it needs its own
// <html>/<body> (the root layout is intentionally minimal). The Studio
// renders its own full-screen UI without the site nav/footer.
export const metadata = {
  title: 'OETZ TROPHY — Studio',
  robots: { index: false, follow: false },
};

export default function StudioLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
