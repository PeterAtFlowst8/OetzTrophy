import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import PageHeader from '@/components/PageHeader';
import FadeIn from '@/components/motion/FadeIn';

const meta = {
  de: { title: 'Galerie — OETZ TROPHY Fotos & Videos', description: 'Fotos und Videos von der OETZ TROPHY, dem Boater X und dem Ötztaler Kajakfestival. Eindrücke von der Ötztaler Ache in Tirol.' },
  en: { title: 'Gallery — OETZ TROPHY Photos & Videos', description: 'Photos and videos from the OETZ TROPHY, Boater X and the Ötztal Kayak Festival. Impressions from the Ötztaler Ache in Tyrol, Austria.' },
};

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const m = meta[(locale === 'en' ? 'en' : 'de') as keyof typeof meta];
  return { title: m.title, description: m.description };
}

export default async function GalleryPage() {
  const t = await getTranslations('gallery');

  return (
    <main>
      <PageHeader label={t('label')} title={t('title')} />

      <section className="py-24 md:py-32" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="max-w-3xl mx-auto px-6 md:px-12 text-center">
          <FadeIn>
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
          </FadeIn>
        </div>
      </section>
    </main>
  );
}
