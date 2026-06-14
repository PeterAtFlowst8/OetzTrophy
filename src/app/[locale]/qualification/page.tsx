import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { PortableText } from '@portabletext/react';
import { Link } from '@/i18n/navigation';
import PageHeader from '@/components/PageHeader';
import TextWithLinks from '@/components/TextWithLinks';
import { richTextComponents } from '@/components/richTextComponents';
import { getOptionalSiteImage, getPageSeo } from '@/lib/siteContent';
import { getPageText, pageTextBody, pageTextString } from '@/lib/pageText';
import { formatShortDate, entryTypeLabel } from '@/lib/events';
import { getSiteSettings } from '@/lib/settings';
import { registrationOpensLabel } from '@/lib/registration';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const m = await getPageSeo('qualification', locale);
  return { title: m.title, description: m.description };
}

export const revalidate = 60;

export default async function QualificationPage() {
  const locale = await getLocale();
  const [text, headerImage, settings] = await Promise.all([
    getPageText('pageQualification'),
    getOptionalSiteImage('qualification', { width: 2000 }),
    getSiteSettings(),
  ]);

  const title =
    pageTextString(text?.title, locale) ||
    (locale === 'de' ? 'Qualifikation' : 'Qualification');
  const body = pageTextBody(text?.body, locale);
  const excerpt = pageTextString(text?.excerpt, locale);

  // Stat block: render only the facts the client has filled in (same fields and
  // styling as the race pages, but the Qualification doc starts blank).
  const facts = [
    text?.date ? { label: locale === 'de' ? 'Datum' : 'Date', value: formatShortDate(text.date, locale) } : null,
    text?.format ? { label: 'Format', value: text.format } : null,
    text?.entryType ? { label: locale === 'de' ? 'Teilnahme' : 'Entry', value: entryTypeLabel(text.entryType, locale) } : null,
  ].filter((f): f is { label: string; value: string } => f !== null);

  const rules = (text?.rules ?? [])
    .map((rule) => (locale === 'en' ? rule.en || rule.de : rule.de || rule.en)?.trim() || '')
    .filter((line) => line.length > 0);

  return (
    <main>
      <PageHeader
        label={pageTextString(text?.pageLabel, locale)}
        title={title}
        image={headerImage}
      />

      <section className="py-16 md:py-24" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="max-w-5xl mx-auto px-6 md:px-12">

          <div className="max-w-3xl mb-16 md:mb-20">
            {body.length > 0 ? (
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '18px', lineHeight: 1.8, color: 'var(--color-body-text)' }}>
                <PortableText value={body} components={richTextComponents} />
              </div>
            ) : (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '18px', lineHeight: 1.8, color: 'var(--color-body-text)' }}>
                {excerpt ||
                  (locale === 'de'
                    ? 'Alle Details zur Qualifikation folgen in Kürze.'
                    : 'Full details on how the qualification works are coming soon.')}
              </p>
            )}
          </div>

          <div>
            {facts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 mb-16 md:mb-20">
                {facts.map((item) => (
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
            )}

            {/* Registration CTA — shared race-weekend registration */}
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
                ? `Anmeldung öffnet am ${registrationOpensLabel(locale, settings.registrationOpensAt)}`
                : `Registration opens ${registrationOpensLabel(locale, settings.registrationOpensAt)}`}
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
                  {rules.map((line, i) => (
                    <li
                      key={i}
                      className="flex gap-4 items-start"
                      style={{ fontFamily: 'var(--font-body)', fontSize: '15px', lineHeight: 1.7, color: 'var(--color-body-text)', padding: '0.75rem 0', borderBottom: '1px solid var(--color-border)' }}
                    >
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '20px', color: 'var(--color-accent)', minWidth: '2ch' }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <TextWithLinks text={line} />
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
