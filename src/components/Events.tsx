const events = [
  {
    title: 'Oetz Kayak Cross',
    subtitle: 'Extreme Slalom · WW III–IV',
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
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-5 md:px-10">

        <p
          className="uppercase tracking-widest mb-3 text-center"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            letterSpacing: '0.2em',
            color: 'var(--color-accent)',
          }}
        >
          Events 2026
        </p>
        <h2
          className="uppercase text-center mb-12"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(36px, 5vw, 64px)',
            fontWeight: 700,
            color: 'var(--color-ink)',
            lineHeight: 0.95,
          }}
        >
          Das Programm
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              {/* Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              {/* Amber accent line — slides up on hover */}
              <div
                className="absolute bottom-0 left-0 right-0 h-1 transition-transform duration-300 group-hover:translate-y-0 translate-y-full"
                style={{ backgroundColor: 'var(--color-accent)' }}
              />
              {/* Text */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3
                  className="uppercase text-white"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(28px, 3vw, 40px)',
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                >
                  {event.title}
                </h3>
                <p
                  className="mt-2 text-white/70 uppercase tracking-wider transition-opacity duration-300 group-hover:text-white/90"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '11px',
                    letterSpacing: '0.12em',
                  }}
                >
                  {event.subtitle}
                </p>
              </div>
            </a>
          ))}
        </div>

      </div>
    </section>
  );
}
