import Hero from '@/components/Hero';
import DasRennen from '@/components/DasRennen';
import Events from '@/components/Events';
import LatestNews from '@/components/LatestNews';
import Sponsors from '@/components/Sponsors';

export default function Home() {
  return (
    <main>
      <Hero />
      <DasRennen />
      <Events />
      <LatestNews />
      <Sponsors />
    </main>
  );
}
