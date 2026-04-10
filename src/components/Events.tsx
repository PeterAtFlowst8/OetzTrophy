import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import FadeIn from '@/components/motion/FadeIn';

const GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`;

const eventConfigs = [
  { image: '/images/event-festival-2.jpg', href: '/kajakfestival' },
  { image: '/images/event-boaterx.jpg', href: '/boater-x' },
  { image: '/images/hero.jpg', href: '/oetz-trophy' },
] as const;

function EventCard({
  event,
  index,
}: {
  event: { title: string; subtitle: string; image: string; href: string };
  index: number;
}) {
  return (
    <FadeIn direction="scale" delay={index * 0.15}>
      <Link
        href={event.href as '/oetz-trophy' | '/boater-x' | '/kajakfestival'}
        className="group relative overflow-hidden block cursor-pointer"
        style={{ aspectRatio: '3/4' }}
      >
        <Image
          src={event.image}
          alt={event.title}
          fill
          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-[#0a0a0a]" style={{ zIndex: -1 }} />

        {/* Gradient — stronger, more dramatic */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10 transition-opacity duration-500 group-hover:opacity-80" />

        {/* Large index number — top left */}
        <span
          aria-hidden="true"
          className="absolute top-4 left-6 md:top-6 md:left-8 transition-transform duration-500 group-hover:translate-y-1"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 'clamp(48px, 6vw, 72px)',
            color: 'rgba(255,255,255,0.08)',
            lineHeight: 1,
          }}
        >
          0{index + 1}
        </span>

        {/* Accent bar — bottom, slides up */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1 translate-y-full transition-transform duration-300 group-hover:translate-y-0"
          style={{ backgroundColor: 'var(--color-accent)' }}
        />

        {/* Content — bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <p
            className="uppercase mb-2 tracking-[0.2em] transition-colors duration-300 group-hover:text-[var(--color-accent)]"
            style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'rgba(255,255,255,0.45)' }}
          >
            {event.subtitle}
          </p>
          <div className="flex items-end justify-between">
            <h3
              className="uppercase text-white leading-none"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(28px, 3.5vw, 48px)',
                fontWeight: 700,
                letterSpacing: '-0.01em',
              }}
            >
              {event.title}
            </h3>
            <span
              className="text-white/0 group-hover:text-[var(--color-accent)] translate-x-3 group-hover:translate-x-0 transition-all duration-300 shrink-0 ml-4"
              style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700 }}
              aria-hidden="true"
            >
              →
            </span>
          </div>
        </div>
      </Link>
    </FadeIn>
  );
}

export default async function Events() {
  const t = await getTranslations('events');

  const events = eventConfigs.map((config, i) => ({
    ...config,
    title: t(`item${i}Title` as Parameters<typeof t>[0]),
    subtitle: t(`item${i}Subtitle` as Parameters<typeof t>[0]),
  }));

  return (
    <section className="relative overflow-hidden" style={{ backgroundColor: 'var(--color-ink)' }}>
      {/* Grain texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: GRAIN, backgroundSize: '200px 200px', opacity: 0.04, mixBlendMode: 'overlay' }}
      />

      <div className="relative max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-32">

        <FadeIn>
          <div className="mb-12 md:mb-16">
            <p
              className="uppercase mb-4"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                letterSpacing: '0.25em',
                color: 'var(--color-accent)',
              }}
            >
              {t('label')}
            </p>
            <h2
              className="uppercase"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(40px, 5.5vw, 72px)',
                fontWeight: 700,
                color: 'white',
                lineHeight: 0.92,
                letterSpacing: '-0.02em',
              }}
            >
              {t('headline')}
            </h2>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {events.map((event, i) => (
            <EventCard key={event.title} event={event} index={i} />
          ))}
        </div>

      </div>
    </section>
  );
}
