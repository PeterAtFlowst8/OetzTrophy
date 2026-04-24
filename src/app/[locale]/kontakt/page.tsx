import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import PageHeader from '@/components/PageHeader';
import FadeIn from '@/components/motion/FadeIn';

const pageMeta = {
  de: { title: 'Kontakt — OETZ TROPHY Veranstalter Source To Sea', description: 'Kontakt zur OETZ TROPHY: Source To Sea GmbH, Natterer See 1, 6161 Natters, Tirol. Telefon, E-Mail und Social Media. Wir freuen uns auf deine Nachricht.' },
  en: { title: 'Contact — OETZ TROPHY Organiser Source To Sea', description: 'Contact OETZ TROPHY: Source To Sea GmbH, Natterer See 1, 6161 Natters, Tyrol, Austria. Phone, email, and social media. We look forward to hearing from you.' },
};

type MetaProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: MetaProps): Promise<Metadata> {
  const { locale } = await params;
  const m = pageMeta[(locale === 'en' ? 'en' : 'de') as keyof typeof pageMeta];
  return { title: m.title, description: m.description };
}

const socialLinks = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/oetz_trophy/',
    handle: '@oetz_trophy',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/c/OETZTROPHYExtremeKayakChampionships',
    handle: 'OETZ TROPHY',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.546 12 3.546 12 3.546s-7.505 0-9.377.504A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.504 9.376.504 9.376.504s7.505 0 9.377-.504a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/oetztrophy',
    handle: '/oetztrophy',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
];

export default async function KontaktPage() {
  const t = await getTranslations('kontakt');

  return (
    <main>
      <PageHeader
        title={t('title')}
        image="/images/page-contact.jpg"
      />

      <section className="py-16 md:py-24" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="max-w-5xl mx-auto px-6 md:px-12">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">

            <FadeIn>
              <div>
                <h2
                  className="uppercase mb-6"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(24px, 3vw, 32px)',
                    fontWeight: 700,
                    color: 'var(--color-ink)',
                  }}
                >
                  {t('orgHeading')}
                </h2>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '15px', lineHeight: 2, color: 'var(--color-body-text)' }}>
                  <p><strong style={{ color: 'var(--color-ink)' }}>Source To Sea GmbH</strong></p>
                  <p>Natterer See 1</p>
                  <p>6161 Natters</p>
                  <p>Tirol / {t('country')}</p>
                </div>

                <div
                  className="mt-8 p-5"
                  style={{
                    borderLeft: '3px solid var(--color-accent)',
                    backgroundColor: 'var(--color-surface)',
                  }}
                >
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', lineHeight: 1.8, color: 'var(--color-body-text)' }}>
                    <strong style={{ color: 'var(--color-ink)' }}>{t('phone')}</strong><br />
                    +43 (0)512 546710
                  </p>
                  <p className="mt-3" style={{ fontFamily: 'var(--font-body)', fontSize: '14px', lineHeight: 1.8, color: 'var(--color-body-text)' }}>
                    <strong style={{ color: 'var(--color-ink)' }}>E-Mail</strong><br />
                    <a href="mailto:info@oetz-trophy.com" style={{ color: 'var(--color-accent)' }}>
                      info@oetz-trophy.com
                    </a>
                  </p>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div>
                <h2
                  className="uppercase mb-6"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(24px, 3vw, 32px)',
                    fontWeight: 700,
                    color: 'var(--color-ink)',
                  }}
                >
                  {t('socialHeading')}
                </h2>
                <div className="flex flex-col gap-3">
                  {socialLinks.map(({ label, href, handle, icon }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="group flex items-center gap-4 p-4 transition-all duration-200 hover:border-[var(--color-accent)]"
                      style={{
                        border: '1px solid var(--color-border)',
                        backgroundColor: 'var(--color-surface)',
                      }}
                    >
                      <span className="shrink-0 text-[var(--color-ink)] transition-colors duration-200 group-hover:text-[var(--color-accent)]">
                        {icon}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span
                          className="block uppercase"
                          style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '16px',
                            fontWeight: 700,
                            color: 'var(--color-ink)',
                          }}
                        >
                          {label}
                        </span>
                        <span
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '12px',
                            color: 'var(--color-muted)',
                          }}
                        >
                          {handle}
                        </span>
                      </span>
                      <span
                        className="shrink-0 opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0"
                        style={{ color: 'var(--color-accent)', fontSize: '14px' }}
                        aria-hidden="true"
                      >
                        →
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </FadeIn>

          </div>

        </div>
      </section>
    </main>
  );
}
