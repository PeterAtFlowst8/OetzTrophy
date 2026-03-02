const events = [
  {
    title: 'Oetz Kayak Cross',
    subtitle: 'Extreme Slalom · WW V',
    image: '/images/hero.jpg',
    href: '/oetz-kayak-cross',
  },
  {
    title: 'Kajakfestival',
    subtitle: 'Drei Tage · Gemeinschaft · Wildwasser',
    image: '/images/event-festival.jpg',
    href: '/kajakfestival',
  },
  {
    title: 'Media Contest',
    subtitle: 'Bestes Foto · Bestes Video',
    image: '/images/event-media-contest.jpg',
    href: '/media-contest',
  },
];

export default function Events() {
  return (
    <section className="py-20 md:py-28" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="max-w-7xl mx-auto px-6 md:px-12">

        {/* Left-aligned editorial header */}
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
            Events 2026
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
            Das Programm
          </h2>
        </div>

        {/* Cards — full width of container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {events.map((event) => (
            <a
              key={event.title}
              href={event.href}
              className="group relative overflow-hidden block"
              style={{ aspectRatio: '3/4' }}
            >
              {/* Photo */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                style={{ backgroundImage: `url('${event.image}')` }}
              />
              {/* Base gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
              {/* Amber bottom accent — slides in on hover */}
              <div
                className="absolute bottom-0 left-0 right-0 h-[3px] translate-y-full transition-transform duration-300 group-hover:translate-y-0"
                style={{ backgroundColor: 'var(--color-accent)' }}
              />
              {/* Event label */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-7">
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
                    fontSize: 'clamp(28px, 2.8vw, 42px)',
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {event.title}
                </h3>
              </div>
            </a>
          ))}
        </div>

      </div>
    </section>
  );
}
