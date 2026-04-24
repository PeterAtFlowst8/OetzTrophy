import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { PortableText } from '@portabletext/react';
import PageHeader from '@/components/PageHeader';
import FadeIn from '@/components/motion/FadeIn';
import { Link } from '@/i18n/navigation';
import { getEventBySlug, localizedField, formatShortDate, entryTypeLabel } from '@/lib/events';

const meta = {
  de: { title: 'Oetz Trophy — Das härteste Kajakrennen der Welt 2026', description: 'Die OETZ TROPHY auf der Ötztaler Ache: Wildwasser V, Start nur nach Qualifikation. Die Rennstrecke fordert Erfahrung, Technik und Mut. 19. September 2026 in Oetz, Tirol.' },
  en: { title: 'Oetz Trophy — The Hardest Kayak Race in the World 2026', description: 'The OETZ TROPHY on the Ötztaler Ache: class V whitewater, qualification required. The course demands experience, technique and courage. 19 September 2026 in Oetz, Tyrol.' },
};

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const m = meta[(locale === 'en' ? 'en' : 'de') as keyof typeof meta];
  return { title: m.title, description: m.description };
}

export const revalidate = 60;

export default async function OetzTrophyPage() {
  const locale = await getLocale();
  const event = await getEventBySlug('oetz-trophy');
  if (!event) notFound();

  const t = await getTranslations('boaterX');
  const title = localizedField(event.title, locale);
  const body = localizedField(event.body, locale);
  const rules = event.rules || [];

  return (
    <main>
      <PageHeader
        label="Oetz Trophy"
        title={title}
        image="/images/hero.jpg"
      />

      <section className="py-16 md:py-24" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="max-w-5xl mx-auto px-6 md:px-12">

          <FadeIn>
            <div className="max-w-3xl mb-16 md:mb-20">
              {body && body.length > 0 ? (
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '18px', lineHeight: 1.8, color: 'var(--color-body-text)' }}>
                  <PortableText value={body} />
                </div>
              ) : (
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '18px', lineHeight: 1.8, color: 'var(--color-body-text)' }}>
                  {localizedField(event.excerpt, locale)}
                </p>
              )}
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 mb-16 md:mb-20">
              {[
                { label: locale === 'de' ? 'Datum' : 'Date', value: formatShortDate(event.date, locale) },
                { label: 'Format', value: event.format },
                { label: locale === 'de' ? 'Teilnahme' : 'Entry', value: entryTypeLabel(event.entryType, locale) },
              ].map((item) => (
                <div key={item.label} style={{ borderLeft: '3px solid var(--color-accent)', paddingLeft: '1.25rem' }}>
                  <p className="uppercase mb-2" style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '0.2em', color: 'var(--color-muted)' }}>
                    {item.label}
                  </p>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: 700, color: 'var(--color-ink)', lineHeight: 1.1, textTransform: 'uppercase' }}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Registration CTA — shared registration with Boater X */}
            <Link
              href="/registration"
              className="inline-flex items-center gap-3 px-6 py-4 mb-16 md:mb-20 transition-opacity duration-200 hover:opacity-90"
              style={{
                backgroundColor: 'var(--color-accent)',
                color: '#111',
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              <span style={{ fontSize: '16px' }}>↗</span>
              {t('regNote')}
            </Link>
          </FadeIn>

          {rules.length > 0 && (
            <FadeIn delay={0.15}>
              <div className="max-w-3xl">
                <h2
                  className="uppercase mb-6"
                  style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, color: 'var(--color-ink)', lineHeight: 0.95 }}
                >
                  {locale === 'de' ? 'Regeln' : 'Rules'}
                </h2>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {rules.map((rule, i) => (
                    <li
                      key={i}
                      className="flex gap-4 items-start"
                      style={{ fontFamily: 'var(--font-body)', fontSize: '15px', lineHeight: 1.7, color: 'var(--color-body-text)', padding: '0.75rem 0', borderBottom: '1px solid var(--color-border)' }}
                    >
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '20px', color: 'var(--color-accent)', minWidth: '2ch' }}>
                        0{i + 1}
                      </span>
                      {localizedField(rule, locale)}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          )}

        </div>
      </section>
    </main>
  );
}
