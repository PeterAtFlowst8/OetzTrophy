import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import PageHeader from '@/components/PageHeader';
import { getOptionalSiteImage, getPageSeo } from '@/lib/siteContent';


type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const m = await getPageSeo('gallery', locale);
  return { title: m.title, description: m.description };
}

export default async function GalleryPage() {
  const t = await getTranslations('gallery');
  const headerImage = await getOptionalSiteImage('gallery', { width: 2000 });

  return (
    <main>
      <PageHeader label={t('label')} title={t('title')} image={headerImage} />

      <section className="py-24 md:py-32" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="max-w-3xl mx-auto px-6 md:px-12 text-center">
          <div>
            <p
              className="uppercase mb-6"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                letterSpacing: '0.25em',
                color: 'var(--color-accent)',
              }}
            >
              {t('comingSoon')}
            </p>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '17px',
                lineHeight: 1.8,
                color: 'var(--color-body-text)',
              }}
            >
              {t('description')}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
