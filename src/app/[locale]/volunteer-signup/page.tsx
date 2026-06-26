import type { Metadata } from 'next';
import VolunteerForm from './VolunteerForm';
import { getSiteImage, getPageSeo } from '@/lib/siteContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const seo = await getPageSeo('volunteerSignup', locale);
  return { title: seo.title, description: seo.description };
}

export default async function VolunteerSignupPage() {
  // Optional Studio header photo (slot `imageVolunteerSignup`), else a festival still.
  const headerImage = await getSiteImage('volunteerSignup', '/images/event-festival.jpg', {
    width: 2000,
  });

  return <VolunteerForm headerImage={headerImage} />;
}
