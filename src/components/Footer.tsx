import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getSponsors, type SponsorLink } from '@/lib/sponsors';

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

function SponsorLogo({
  sponsor,
  size = 'standard',
}: {
  sponsor: SponsorLink;
  size?: 'featured' | 'standard' | 'compact';
}) {
  const isFeatured = size === 'featured';
  const isCompact = size === 'compact';
  const className = [
    'group flex min-h-12 items-center justify-center transition duration-200 hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent-dark)]',
    isFeatured ? 'px-1.5' : 'px-1',
  ].join(' ');

  const logo = (
    <Image
      src={sponsor.logoUrl}
      alt={sponsor.name}
      width={isFeatured ? 190 : 150}
      height={isFeatured ? 80 : 60}
      sizes={isFeatured ? '(min-width: 1024px) 190px, 150px' : '150px'}
      className={[
        'w-auto object-contain transition duration-200',
        isFeatured
          ? 'max-h-14 max-w-[190px]'
          : isCompact
            ? 'max-h-8 max-w-[118px]'
            : 'max-h-11 max-w-[152px]',
      ].join(' ')}
    />
  );

  if (!sponsor.href) {
    return (
      <div title={sponsor.name} className="flex min-h-12 items-center justify-center px-0.5">
        {logo}
      </div>
    );
  }

  return (
    <a
      href={sponsor.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open ${sponsor.name} website in a new tab`}
      title={sponsor.name}
      className={className}
    >
      {logo}
    </a>
  );
}

export default async function Footer() {
  const [t, ts, sponsors] = await Promise.all([
    getTranslations('footer'),
    getTranslations('sponsors'),
    getSponsors(),
  ]);

  const footerLinks = [
    { label: t('impressum'), href: '/impressum' as const },
    { label: t('terms'), href: '/terms-and-conditions' as const },
    { label: t('kontakt'), href: '/kontakt' as const },
    { label: t('datenschutz'), href: '/datenschutz' as const },
  ];
  const visibleSponsors = sponsors.filter((sponsor) => sponsor.logoUrl);

  return (
    <footer className="relative bg-[var(--color-ink)] text-white">
      <div className="h-1 bg-[var(--color-accent)]" aria-hidden="true" />

      <section className="relative" aria-label={`${t('followUs')} ${ts('label')}`}>
        <div className="mx-auto max-w-7xl px-6 py-12 md:px-12 md:py-16">
          <div className="grid overflow-hidden border border-white/10 lg:grid-cols-[minmax(280px,360px)_minmax(0,1fr)]">
            <div className="flex flex-col justify-between gap-10 bg-[var(--color-ink)] p-7 md:p-10">
              <div className="flex flex-col items-start gap-6 text-left">
                <Image
                  src="/images/logo-white.webp"
                  alt="OETZ TROPHY"
                  width={260}
                  height={48}
                  style={{ width: '220px', height: 'auto', opacity: 0.92 }}
                />

                <p
                  className="max-w-xs uppercase"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '11px',
                    lineHeight: 1.7,
                    letterSpacing: '0.18em',
                    color: 'rgba(255,255,255,0.36)',
                  }}
                >
                  {t('tagline')}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <p
                  className="uppercase"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(28px, 2.4vw, 36px)',
                    fontWeight: 700,
                    lineHeight: 1,
                    color: 'rgba(255,255,255,0.92)',
                  }}
                >
                  {t('followUs')}
                </p>

                <div className="flex items-center gap-3">
                  {socialLinks.map(({ label, href, icon }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="flex h-11 w-11 items-center justify-center border border-white/15 text-white/60 transition duration-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)] [&_svg]:h-6 [&_svg]:w-6"
                      style={{ borderRadius: '4px' }}
                    >
                      {icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {visibleSponsors.length > 0 && (
              <div className="relative bg-[var(--color-background)] p-7 text-left text-[var(--color-ink)] md:p-10">
                <div className="absolute inset-x-0 top-0 h-1 bg-[var(--color-accent)]" aria-hidden="true" />

                <div className="mb-7 flex w-full items-end justify-between gap-6">
                  <p
                    className="uppercase"
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'clamp(34px, 3vw, 48px)',
                      fontWeight: 700,
                      lineHeight: 0.95,
                      color: 'var(--color-ink)',
                    }}
                  >
                    {ts('label')}
                  </p>

                  <span
                    className="hidden uppercase sm:block"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '10px',
                      letterSpacing: '0.18em',
                      color: 'var(--color-accent-dark)',
                    }}
                  >
                    OETZ TROPHY
                  </span>
                </div>

                <div className="flex w-full flex-wrap items-center justify-start gap-x-7 gap-y-6 sm:gap-x-9 xl:gap-x-11">
                  {visibleSponsors.map((sponsor) => (
                    <SponsorLogo
                      key={sponsor.name}
                      sponsor={sponsor}
                      size={sponsor.tier === 'gold' ? 'featured' : sponsor.tier === 'bronze' ? 'compact' : 'standard'}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <div
        className="relative mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-7 text-center md:flex-row md:px-12 md:text-left"
        style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex flex-col items-center gap-3 md:items-start">
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              letterSpacing: '0.08em',
              color: 'rgba(255,255,255,0.34)',
            }}
          >
            {t('copyright')}
          </span>

          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '10px',
              letterSpacing: '0.1em',
              color: 'rgba(255,255,255,0.18)',
            }}
          >
            Design &amp; Entwicklung{' '}
            <a
              href="https://www.flowst8.eu"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/30 transition-colors duration-200 hover:text-white/55"
            >
              FlowSt8 Digital
            </a>
          </span>
        </div>

        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-3 md:justify-end" aria-label="Footer Legal Navigation">
          {footerLinks.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="text-white/35 uppercase transition-colors duration-200 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)]"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '10px',
                letterSpacing: '0.14em',
              }}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
