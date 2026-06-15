import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { PortableText } from '@portabletext/react';
import PageHeader from '@/components/PageHeader';
import { richTextComponents } from '@/components/richTextComponents';
import { getSiteImage, getPageSeo } from '@/lib/siteContent';
import { getSiteSettings } from '@/lib/settings';
import { registrationOpensLabel } from '@/lib/registration';
import { Link } from '@/i18n/navigation';
import { getRaceContent, eventPageLabel, localizedField, localizedFormat, formatShortDate, entryTypeLabel } from '@/lib/events';
import TextWithLinks from '@/components/TextWithLinks';


type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const m = await getPageSeo('boaterX', locale);
  return { title: m.title, description: m.description };
}

export const revalidate = 60;

export default async function KayakCrossPage() {
  const locale = await getLocale();
  const event = await getRaceContent('pageKayakCross', 'event-boater-x', 'kayak-cross');
  if (!event) notFound();

  const t = await getTranslations('boaterX');
  const title = localizedField(event.title, locale);
  const body = localizedField(event.body, locale);
  const rules = event.rules || [];

  const headerImage = await getSiteImage('boaterX', '/images/event-boaterx.jpg', { width: 2000 });
  const { registrationOpensAt } = await getSiteSettings();

  return (
    <main>
      <PageHeader
        label={eventPageLabel(event, locale)}
        title={title}
        image={headerImage}
      />

      <section className="py-16 md:py-24" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="max-w-5xl mx-auto px-6 md:px-12">

          <div>
            <div className="max-w-3xl mb-16 md:mb-20">
              {body && body.length > 0 ? (
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '18px', lineHeight: 1.8, color: 'var(--color-body-text)' }}>
                  <PortableText value={body} components={richTextComponents} />
                </div>
              ) : (
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '18px', lineHeight: 1.8, color: 'var(--color-body-text)' }}>
                  <TextWithLinks text={localizedField(event.excerpt, locale)} />
                </p>
              )}
            </div>
          </div>

          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 mb-16 md:mb-20">
              {[
                { label: locale === 'de' ? 'Datum' : 'Date', value: formatShortDate(event.date, locale) },
                { label: 'Format', value: localizedFormat(event.format, locale) },
                { label: locale === 'de' ? 'Teilnahme' : 'Entry', value: entryTypeLabel(event.entryType, locale) },
              ].map((item) => (
                <div key={item.label} style={{ borderTop: '3px solid var(--color-accent)', paddingTop: '1rem' }}>
                  <p className="uppercase mb-2" style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '0.2em', color: 'var(--color-muted)' }}>
                    {item.label}
                  </p>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: 700, color: 'var(--color-ink)', lineHeight: 1.1, textTransform: 'uppercase' }}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Registration CTA */}
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
              {locale === 'de'
                ? `Anmeldung öffnet am ${registrationOpensLabel(locale, registrationOpensAt)}`
                : `Registration opens ${registrationOpensLabel(locale, registrationOpensAt)}`}
            </Link>
          </div>

          {rules.length > 0 && (
            <div>
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
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <TextWithLinks text={localizedField(rule, locale)} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

        </div>
      </section>
    </main>
  );
}
