import Hero from '@/components/Hero';
import Countdown from '@/components/Countdown';
import DasRennen from '@/components/DasRennen';
import Events from '@/components/Events';
import LatestNews from '@/components/LatestNews';
import Sponsors from '@/components/Sponsors';

export default function Home() {
  return (
    <main>
      <Hero />
      <Countdown />
      <DasRennen />
      <Events />
      <LatestNews />
      <Sponsors />
    </main>
  );
}
