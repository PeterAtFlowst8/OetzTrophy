import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { latestPosts } from '@/lib/news';
import FadeIn from '@/components/motion/FadeIn';
import { StaggerContainer, StaggerItem } from '@/components/motion/StaggerChildren';

export default async function LatestNews() {
  const t = await getTranslations('news');

  return (
    <section style={{ backgroundColor: 'var(--color-surface)' }}>

      <div
        className="max-w-7xl mx-auto px-6 md:px-12 pt-20 md:pt-28 pb-10 md:pb-12"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <FadeIn>
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
                {t('label')}
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
                {t('headline')}
              </h2>
            </div>
            <Link
              href="/news"
              className="uppercase shrink-0 pb-1 transition-colors duration-200 hover:text-[var(--color-accent)]"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                letterSpacing: '0.2em',
                color: 'var(--color-muted)',
              }}
            >
              {t('viewAll')} →
            </Link>
          </div>
        </FadeIn>
      </div>

      <StaggerContainer className="max-w-7xl mx-auto px-6 md:px-12 pb-20 md:pb-28" stagger={0.12}>
        {latestPosts.map((post, i) => (
          <StaggerItem key={post.slug}>
            <article
              style={{ borderBottom: '1px solid var(--color-border)' }}
            >
              <div className="py-8 md:py-10 flex gap-4 md:gap-14 items-start">

                <span
                  className="shrink-0 leading-none select-none hidden md:block"
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

                <div className="flex-1 min-w-0">
                  <time
                    className="block uppercase mb-2"
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
                    className="uppercase mb-3"
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'clamp(22px, 3.5vw, 48px)',
                      fontWeight: 700,
                      color: 'var(--color-ink)',
                      lineHeight: 0.95,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {post.title}
                  </h3>

                  <p
                    className="max-w-2xl"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '14px',
                      lineHeight: 1.7,
                      color: 'var(--color-body-text)',
                    }}
                  >
                    {post.excerpt}
                  </p>
                </div>

              </div>
            </article>
          </StaggerItem>
        ))}
      </StaggerContainer>

    </section>
  );
}
