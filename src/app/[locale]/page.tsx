import Hero from '@/components/Hero';
import MarqueeBanner from '@/components/Marquee';
import FestivalOverview from '@/components/FestivalOverview';
import Events from '@/components/Events';
import DasRennen from '@/components/DasRennen';
import LatestNews from '@/components/LatestNews';
import JsonLd, { organizationSchema, festivalEventSchema } from '@/components/JsonLd';
import { getSiteSettings } from '@/lib/settings';
import { getSiteImage } from '@/lib/siteContent';

export const revalidate = 60;

export default async function Home() {
  const [settings, heroImage] = await Promise.all([
    getSiteSettings(),
    getSiteImage('hero', '/images/hero.jpg', { width: 2000 }),
  ]);

  return (
    <main>
      <JsonLd data={organizationSchema} />
      <JsonLd data={festivalEventSchema} />
      <Hero festivalDate={settings.festivalDate} imageSrc={heroImage} />
      <MarqueeBanner />
      <FestivalOverview festivalDate={settings.festivalDate} festivalEndDate={settings.festivalEndDate} />
      <Events />
      <DasRennen />
      <LatestNews />
    </main>
  );
}
