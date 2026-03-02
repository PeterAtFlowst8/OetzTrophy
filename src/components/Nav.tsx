'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-sm py-3' : 'py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        <Link href="/" className="block">
          {scrolled ? (
            <Image
              src="/images/logo.png"
              alt="OETZ TROPHY"
              width={220}
              height={40}
              className="h-8 w-auto object-contain"
              priority
            />
          ) : (
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '26px',
                color: 'white',
                letterSpacing: '0.03em',
                lineHeight: 1,
                textShadow: '0 1px 12px rgba(0,0,0,0.5)',
              }}
            >
              OETZ TROPHY
            </span>
          )}
        </Link>
      </div>
    </nav>
  );
}
