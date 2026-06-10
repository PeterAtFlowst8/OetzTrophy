import Hero from '@/components/Hero';
import MarqueeBanner from '@/components/Marquee';
import FestivalOverview from '@/components/FestivalOverview';
import Events from '@/components/Events';
import LatestNews from '@/components/LatestNews';
import JsonLd, { organizationSchema, festivalEventSchema } from '@/components/JsonLd';
import { getSiteSettings } from '@/lib/settings';
import { getHeroMedia } from '@/lib/siteContent';

export const revalidate = 60;

export default async function Home() {
  const [settings, heroMedia] = await Promise.all([
    getSiteSettings(),
    getHeroMedia({ fallbackUrl: '/images/hero.jpg', width: 2000 }),
  ]);

  return (
    <main className="overflow-x-clip">
      <JsonLd data={organizationSchema} />
      <JsonLd data={festivalEventSchema} />
      <Hero
        festivalDate={settings.festivalDate}
        registrationOpensAt={settings.registrationOpensAt}
        imageSrc={heroMedia.imageUrl}
        imageAlt={heroMedia.alt}
        mediaType={heroMedia.type}
        videoSrc={heroMedia.videoUrl}
        videoAutoplay={heroMedia.autoplay}
      />
      <MarqueeBanner />
      <FestivalOverview festivalDate={settings.festivalDate} festivalEndDate={settings.festivalEndDate} />
      <Events />
      <LatestNews />
    </main>
  );
}
