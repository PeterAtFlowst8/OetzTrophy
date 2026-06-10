import type { Metadata } from 'next';
import { getPageSeo } from '@/lib/siteContent';


type Props = { params: Promise<{ locale: string }>; children: React.ReactNode };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = await getPageSeo('registration', locale);
  return { title: m.title, description: m.description };
}

export const revalidate = 60;

export default async function RegistrationLayout({ children }: Props) {
  return <>{children}</>;
}
