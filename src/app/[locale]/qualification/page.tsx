import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { PortableText } from '@portabletext/react';
import PageHeader from '@/components/PageHeader';
import { richTextComponents } from '@/components/richTextComponents';
import { getOptionalSiteImage, getPageSeo } from '@/lib/siteContent';
import { getPageText, pageTextBody, pageTextString } from '@/lib/pageText';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const m = await getPageSeo('qualification', locale);
  return { title: m.title, description: m.description };
}

export const revalidate = 60;

export default async function QualificationPage() {
  const locale = await getLocale();
  const [text, headerImage] = await Promise.all([
    getPageText('pageQualification'),
    getOptionalSiteImage('qualification', { width: 2000 }),
  ]);

  const title =
    pageTextString(text?.title, locale) ||
    (locale === 'de' ? 'Qualifikation' : 'Qualification');
  const body = pageTextBody(text?.body, locale);

  return (
    <main>
      <PageHeader
        label={pageTextString(text?.pageLabel, locale)}
        title={title}
        image={headerImage}
      />

      <section className="py-16 md:py-24" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="max-w-3xl mx-auto px-6 md:px-12">
          {body.length > 0 ? (
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '18px', lineHeight: 1.8, color: 'var(--color-body-text)' }}>
              <PortableText value={body} components={richTextComponents} />
            </div>
          ) : (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '18px', lineHeight: 1.8, color: 'var(--color-body-text)' }}>
              {locale === 'de'
                ? 'Alle Details zur Qualifikation folgen in Kürze.'
                : 'Full details on how the qualification works are coming soon.'}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
