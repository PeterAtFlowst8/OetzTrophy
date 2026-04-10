import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

const GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`;

const socialLinks = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/oetz_trophy/',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/c/OETZTROPHYExtremeKayakChampionships',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.546 12 3.546 12 3.546s-7.505 0-9.377.504A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.504 9.376.504 9.376.504s7.505 0 9.377-.504a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/oetztrophy',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
];

export default async function Footer() {
  const t = await getTranslations('footer');

  const footerLinks = [
    { label: t('impressum'), href: '/impressum' as const },
    { label: t('kontakt'), href: '/kontakt' as const },
    { label: t('datenschutz'), href: '/datenschutz' as const },
  ];

  return (
    <footer className="relative" style={{ backgroundColor: 'var(--color-ink)' }}>
      {/* Grain texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: GRAIN,
          backgroundSize: '200px 200px',
          opacity: 0.04,
          mixBlendMode: 'overlay',
        }}
      />

      <div className="relative" style={{ height: '4px', backgroundColor: 'var(--color-accent)' }} />

      <div className="relative text-center px-6 pt-16 md:pt-24 pb-10 md:pb-14">
        <img
          src="/images/logo-white.webp"
          alt="OETZ TROPHY"
          className="mx-auto"
          style={{
            width: 'clamp(220px, 40vw, 440px)',
            height: 'auto',
            opacity: 0.92,
          }}
        />
        <p
          className="mt-4 uppercase"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            letterSpacing: '0.28em',
            color: 'rgba(255,255,255,0.25)',
          }}
        >
          {t('tagline')}
        </p>
      </div>

      <div
        className="relative max-w-7xl mx-auto px-6 md:px-12"
        style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
      />

      <div className="relative max-w-7xl mx-auto px-6 md:px-12 py-7 flex flex-col md:flex-row items-center justify-between gap-5">

        <nav className="flex gap-7" aria-label="Footer Navigation">
          {footerLinks.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="uppercase transition-colors duration-200 hover:text-white/70"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                letterSpacing: '0.18em',
                color: 'rgba(255,255,255,0.35)',
              }}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          {socialLinks.map(({ label, href, icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="transition-colors duration-200 hover:text-[var(--color-accent)]"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              {icon}
            </a>
          ))}
        </div>

        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            letterSpacing: '0.12em',
            color: 'rgba(255,255,255,0.18)',
          }}
        >
          {t('copyright')}
        </span>

      </div>

      {/* Credit */}
      <div
        className="relative text-center pb-5"
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '10px',
          letterSpacing: '0.1em',
          color: 'rgba(255,255,255,0.12)',
        }}
      >
        Design &amp; Entwicklung{' '}
        <a
          href="https://www.flowst8.eu"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors duration-200 hover:text-white/30"
          style={{ color: 'rgba(255,255,255,0.2)' }}
        >
          FlowSt8 Digital
        </a>
      </div>
    </footer>
  );
}
