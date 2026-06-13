import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import PageHeader from '@/components/PageHeader';
import ComingSoonSection from '@/components/ComingSoonSection';
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

      <ComingSoonSection eyebrow={t('comingSoon')} body={t('description')} />
    </main>
  );
}
