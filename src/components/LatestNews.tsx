import { latestPosts } from '@/lib/news';

export default function LatestNews() {
  return (
    <section className="py-20 md:py-28" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="max-w-5xl mx-auto px-5 md:px-10">

        <p
          className="uppercase tracking-widest mb-3"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            letterSpacing: '0.2em',
            color: 'var(--color-accent)',
          }}
        >
          Neuigkeiten
        </p>
        <h2
          className="uppercase mb-12"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(36px, 5vw, 64px)',
            fontWeight: 700,
            color: 'var(--color-ink)',
            lineHeight: 0.95,
          }}
        >
          Aktuelles
        </h2>

        <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
          {latestPosts.map((post) => (
            <article key={post.slug} className="py-8 group">
              <time
                className="block uppercase tracking-wider mb-2"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  letterSpacing: '0.12em',
                  color: 'var(--color-muted)',
                }}
              >
                {post.date}
              </time>
              <h3
                className="uppercase mb-3"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(22px, 2.5vw, 32px)',
                  fontWeight: 700,
                  color: 'var(--color-ink)',
                  lineHeight: 1.05,
                }}
              >
                {post.title}
              </h3>
              <p
                className="mb-4"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '15px',
                  lineHeight: 1.65,
                  color: 'var(--color-body-text)',
                }}
              >
                {post.excerpt}
              </p>
              <a
                href={post.href}
                className="inline-flex items-center gap-1 uppercase tracking-wider font-semibold transition-all duration-200 hover:gap-2"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  letterSpacing: '0.12em',
                  color: 'var(--color-accent)',
                }}
              >
                Weiterlesen <span aria-hidden="true">→</span>
              </a>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}
