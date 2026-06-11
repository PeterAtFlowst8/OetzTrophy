'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import type { MenuItem } from '@/lib/siteContent';

const desktopLinks = [
  { href: '/oetz-trophy', labelKey: 'race' },
  { href: '/kayak-cross', labelKey: 'boaterX' },
  { href: '/kajakfestival', labelKey: 'festival' },
  { href: '/programm', labelKey: 'program' },
  { href: '/news', labelKey: 'news' },
];

const mobileLinks = [
  { href: '/registration', labelKey: 'registration' },
  ...desktopLinks,
  { href: '/kontakt', labelKey: 'contact' },
];

type Props = {
  logoSolid?: string;
  logoTransparent?: string;
  /** Client-managed menu from Studio; null/empty = built-in menu above. */
  menuItems?: MenuItem[] | null;
};

/** A menu entry resolved to a concrete label + destination. */
type ResolvedItem = MenuItem;

export default function Nav({
  logoSolid = '/images/logo-dark.webp',
  logoTransparent = '/images/logo-white.webp',
  menuItems = null,
}: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();

  const builtIn = (links: typeof mobileLinks): ResolvedItem[] =>
    links.map(({ href, labelKey }) => ({
      href,
      label: t(labelKey as Parameters<typeof t>[0]),
      external: false,
    }));

  const custom = menuItems && menuItems.length > 0 ? menuItems : null;
  const desktopItems: ResolvedItem[] = custom ?? builtIn(desktopLinks);
  // Registration stays pinned first in the mobile menu even with a custom
  // list (it's the primary CTA, tied to the registration-open logic).
  const mobileItems: ResolvedItem[] = custom
    ? [
        { href: '/registration', label: t('registration'), external: false },
        ...custom.filter((item) => item.href !== '/registration'),
      ]
    : builtIn(mobileLinks);

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
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between overflow-hidden">
          <Link href="/" className="block shrink-0 min-w-0 relative">
            {/* Logo for solid white nav */}
            <Image
              src={logoSolid}
              alt="OETZ TROPHY"
              width={440}
              height={81}
              className="h-6 md:h-8 w-auto object-contain transition-opacity duration-300"
              style={{ opacity: showSolidBg ? 1 : 0 }}
              loading="eager"
              priority
            />
            {/* Logo for transparent hero nav */}
            <Image
              src={logoTransparent}
              alt="OETZ TROPHY"
              width={440}
              height={81}
              className="absolute inset-0 h-6 md:h-8 w-auto object-contain transition-opacity duration-300"
              style={{ opacity: showSolidBg ? 0 : 1 }}
              loading="eager"
              priority
            />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-7">
            {desktopItems.map(({ href, label, external }) => {
              const className = 'uppercase transition-opacity duration-200 hover:opacity-70';
              const style = {
                fontFamily: 'var(--font-body)',
                fontWeight: 500,
                fontSize: '11px',
                letterSpacing: '0.15em',
                color: showSolidBg ? 'var(--color-ink)' : 'rgba(255,255,255,0.8)',
              } as const;
              return external ? (
                <a key={href} href={href} target="_blank" rel="noopener noreferrer" className={className} style={style}>
                  {label}
                </a>
              ) : (
                <Link key={href} href={href} className={className} style={style}>
                  {label}
                </Link>
              );
            })}

            <Link
              href="/registration"
              className="uppercase transition-colors duration-200 hover:bg-[var(--color-accent-dark)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
              style={{
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-ink)',
                fontFamily: 'var(--font-body)',
                fontWeight: 700,
                fontSize: '11px',
                letterSpacing: '0.13em',
                padding: '0.7rem 0.85rem',
              }}
            >
              {t('registration')}
            </Link>

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
              aria-label={t('menuLabel')}
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
          {mobileItems.map(({ href, label, external }) => {
            const style = {
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '28px',
              color: href === '/registration' ? 'var(--color-accent)' : 'white',
              letterSpacing: '0.02em',
            } as const;
            return external ? (
              <a key={href} href={href} target="_blank" rel="noopener noreferrer" className="uppercase" style={style} onClick={() => setMenuOpen(false)}>
                {label}
              </a>
            ) : (
              <Link key={href} href={href} className="uppercase" style={style}>
                {label}
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
