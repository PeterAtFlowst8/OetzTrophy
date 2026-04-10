import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import FadeIn from '@/components/motion/FadeIn';

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
    <FadeIn direction="scale" delay={index * 0.12}>
      <Link
        href={event.href as '/oetz-trophy' | '/boater-x' | '/kajakfestival'}
        className="group relative overflow-hidden block cursor-pointer"
        style={{ aspectRatio: '3/4' }}
      >
        <Image
          src={event.image}
          alt={event.title}
          fill
          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-[#1a1a1a]" style={{ zIndex: -1 }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
        <div
          className="absolute bottom-0 left-0 right-0 h-[3px] translate-y-full transition-transform duration-300 group-hover:translate-y-0"
          style={{ backgroundColor: 'var(--color-accent)' }}
        />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 flex items-end justify-between">
          <div>
            <p
              className="uppercase mb-2 text-white/50 tracking-[0.2em]"
              style={{ fontFamily: 'var(--font-body)', fontSize: '10px' }}
            >
              {event.subtitle}
            </p>
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
          </div>
          <span
            className="text-white/0 group-hover:text-white/70 translate-x-2 group-hover:translate-x-0 transition-all duration-300 shrink-0 ml-4"
            style={{ fontFamily: 'var(--font-body)', fontSize: '18px' }}
            aria-hidden="true"
          >
            →
          </span>
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
    <section className="py-20 md:py-28" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="max-w-7xl mx-auto px-6 md:px-12">

        <FadeIn>
          <div className="mb-10 md:mb-14">
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
                color: 'var(--color-ink)',
                lineHeight: 0.92,
                letterSpacing: '-0.02em',
              }}
            >
              {t('headline')}
            </h2>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {events.map((event, i) => (
            <EventCard key={event.title} event={event} index={i} />
          ))}
        </div>

      </div>
    </section>
  );
}
