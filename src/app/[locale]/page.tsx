import Hero from '@/components/Hero';
import MarqueeBanner from '@/components/Marquee';
import FestivalOverview from '@/components/FestivalOverview';
import Events from '@/components/Events';
import DasRennen from '@/components/DasRennen';
import LatestNews from '@/components/LatestNews';
import Sponsors from '@/components/Sponsors';
import JsonLd, { organizationSchema, festivalEventSchema } from '@/components/JsonLd';
import { getSiteSettings } from '@/lib/settings';

export const revalidate = 60;

export default async function Home() {
  const settings = await getSiteSettings();

  return (
    <main>
      <JsonLd data={organizationSchema} />
      <JsonLd data={festivalEventSchema} />
      <Hero festivalDate={settings.festivalDate} />
      <MarqueeBanner />
      <FestivalOverview />
      <Events />
      <DasRennen />
      <LatestNews />
      <Sponsors />
    </main>
  );
}
