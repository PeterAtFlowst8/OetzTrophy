import type { ReactNode } from 'react';

// Root layout is intentionally minimal — [locale]/layout.tsx owns <html> and <body>
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
