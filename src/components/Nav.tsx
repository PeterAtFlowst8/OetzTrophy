'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';

const desktopLinks = [
  { href: '/oetz-trophy', labelKey: 'race' },
  { href: '/boater-x', labelKey: 'boaterX' },
  { href: '/kajakfestival', labelKey: 'festival' },
  { href: '/news', labelKey: 'news' },
];

const mobileLinks = [
  ...desktopLinks,
  { href: '/kontakt', labelKey: 'contact' },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();

  const isHome = pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const showSolidBg = scrolled || !isHome;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          showSolidBg ? 'bg-white shadow-sm py-3' : 'py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <Link href="/" className="block shrink-0">
            <Image
              src="/images/logo.png"
              alt="OETZ TROPHY"
              width={220}
              height={40}
              className="h-6 md:h-8 w-auto object-contain transition-all duration-300"
              style={{
                filter: showSolidBg ? 'none' : 'invert(1)',
                mixBlendMode: showSolidBg ? 'normal' : 'screen',
              }}
              priority
            />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-7">
            {desktopLinks.map(({ href, labelKey }) => (
              <Link
                key={href}
                href={href}
                className="uppercase transition-opacity duration-200 hover:opacity-70"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontWeight: 500,
                  fontSize: '11px',
                  letterSpacing: '0.15em',
                  color: showSolidBg ? 'var(--color-ink)' : 'rgba(255,255,255,0.8)',
                }}
              >
                {t(labelKey as Parameters<typeof t>[0])}
              </Link>
            ))}

            <Link
              href={pathname}
              locale={locale === 'de' ? 'en' : 'de'}
              className="uppercase transition-opacity duration-200 hover:opacity-70 ml-2"
              style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                fontSize: '11px',
                letterSpacing: '0.2em',
                color: showSolidBg ? 'var(--color-accent)' : 'rgba(255,255,255,0.7)',
              }}
            >
              {t('switchTo')}
            </Link>
          </div>

          {/* Mobile: lang + hamburger */}
          <div className="flex md:hidden items-center gap-4">
            <Link
              href={pathname}
              locale={locale === 'de' ? 'en' : 'de'}
              className="uppercase"
              style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                fontSize: '11px',
                letterSpacing: '0.2em',
                color: showSolidBg ? 'var(--color-ink)' : 'rgba(255,255,255,0.7)',
              }}
            >
              {t('switchTo')}
            </Link>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="relative w-6 h-5 flex flex-col justify-between"
              aria-label="Menu"
            >
              <span
                className="block h-[2px] w-full transition-all duration-300"
                style={{
                  backgroundColor: showSolidBg ? 'var(--color-ink)' : 'white',
                  transform: menuOpen ? 'rotate(45deg) translateY(9px)' : 'none',
                }}
              />
              <span
                className="block h-[2px] w-full transition-all duration-300"
                style={{
                  backgroundColor: showSolidBg ? 'var(--color-ink)' : 'white',
                  opacity: menuOpen ? 0 : 1,
                }}
              />
              <span
                className="block h-[2px] w-full transition-all duration-300"
                style={{
                  backgroundColor: showSolidBg ? 'var(--color-ink)' : 'white',
                  transform: menuOpen ? 'rotate(-45deg) translateY(-9px)' : 'none',
                }}
              />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-5 md:hidden"
          style={{ backgroundColor: 'var(--color-ink)' }}
        >
          {mobileLinks.map(({ href, labelKey }) => (
            <Link
              key={href}
              href={href}
              className="uppercase"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '28px',
                color: 'white',
                letterSpacing: '0.02em',
              }}
            >
              {t(labelKey as Parameters<typeof t>[0])}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
