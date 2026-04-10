import Hero from '@/components/Hero';
import MarqueeBanner from '@/components/Marquee';
import FestivalOverview from '@/components/FestivalOverview';
import Events from '@/components/Events';
import DasRennen from '@/components/DasRennen';
import LatestNews from '@/components/LatestNews';
import Sponsors from '@/components/Sponsors';
import JsonLd, { organizationSchema, festivalEventSchema } from '@/components/JsonLd';

export default function Home() {
  return (
    <main>
      <JsonLd data={organizationSchema} />
      <JsonLd data={festivalEventSchema} />
      <Hero />
      <MarqueeBanner />
      <FestivalOverview />
      <Events />
      <DasRennen />
      <LatestNews />
      <Sponsors />
    </main>
  );
}
