import { latestPosts } from '@/lib/news';

export default function LatestNews() {
  return (
    <section style={{ backgroundColor: 'var(--color-surface)' }}>

      {/* Section header */}
      <div
        className="max-w-7xl mx-auto px-6 md:px-12 pt-20 md:pt-28 pb-10 md:pb-12"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="flex items-end justify-between gap-4">
          <div>
            <p
              className="uppercase mb-3"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                letterSpacing: '0.25em',
                color: 'var(--color-accent)',
              }}
            >
              Neuigkeiten
            </p>
            <h2
              className="uppercase leading-none"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(44px, 6vw, 80px)',
                fontWeight: 700,
                color: 'var(--color-ink)',
                letterSpacing: '-0.02em',
              }}
            >
              Aktuelles
            </h2>
          </div>
          <p
            className="uppercase shrink-0 pb-1"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              letterSpacing: '0.2em',
              color: 'var(--color-muted)',
            }}
          >
            {latestPosts.length} Artikel
          </p>
        </div>
      </div>

      {/* Article list */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 pb-20 md:pb-28">
        {latestPosts.map((post, i) => (
          <article
            key={post.slug}
            className="group"
            style={{ borderBottom: '1px solid var(--color-border)' }}
          >
            <div className="py-10 md:py-12 flex gap-6 md:gap-14 items-start">

              {/* Index number — amber, large */}
              <span
                className="shrink-0 leading-none select-none"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: 'clamp(36px, 5vw, 64px)',
                  color: 'var(--color-accent)',
                  letterSpacing: '-0.02em',
                  opacity: 0.9,
                  minWidth: '2ch',
                }}
                aria-hidden="true"
              >
                0{i + 1}
              </span>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <time
                  className="block uppercase mb-3"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '11px',
                    letterSpacing: '0.18em',
                    color: 'var(--color-muted)',
                  }}
                >
                  {post.date}
                </time>

                <h3
                  className="uppercase mb-4 transition-colors duration-200 group-hover:text-[var(--color-accent)]"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(26px, 3.5vw, 48px)',
                    fontWeight: 700,
                    color: 'var(--color-ink)',
                    lineHeight: 0.95,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {post.title}
                </h3>

                <p
                  className="mb-5 max-w-2xl"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '15px',
                    lineHeight: 1.7,
                    color: 'var(--color-body-text)',
                  }}
                >
                  {post.excerpt}
                </p>

                <a
                  href={post.href}
                  className="inline-flex items-center gap-1.5 uppercase tracking-widest font-semibold transition-all duration-200 hover:gap-3"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '11px',
                    letterSpacing: '0.18em',
                    color: 'var(--color-accent)',
                  }}
                >
                  Weiterlesen <span aria-hidden="true">→</span>
                </a>
              </div>

            </div>
          </article>
        ))}
      </div>

    </section>
  );
}
