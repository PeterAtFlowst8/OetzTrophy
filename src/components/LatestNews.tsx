import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getLatestPosts, localizedTitle, localizedSlug, localizedExcerpt, formatDate } from '@/lib/news';
import FadeIn from '@/components/motion/FadeIn';

export const revalidate = 60;

export default async function LatestNews() {
  const t = await getTranslations('news');
  const locale = await getLocale();
  const posts = await getLatestPosts(3);

  if (posts.length === 0) return null;

  return (
    <section style={{ backgroundColor: 'var(--color-background)' }}>

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-24 md:pt-32 pb-10 md:pb-12">
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

      <div className="max-w-7xl mx-auto px-6 md:px-12 pb-24 md:pb-32">
        {posts.map((post, i) => (
          <FadeIn key={post._id} direction={i % 2 === 0 ? 'left' : 'right'} delay={i * 0.1}>
            <article
              className="group"
              style={{ borderTop: i === 0 ? '1px solid var(--color-border)' : 'none', borderBottom: '1px solid var(--color-border)' }}
            >
              <Link
                href={`/news/${localizedSlug(post, locale)}` as '/news/regeln-zur-teilnahme'}
                className="block py-8 md:py-10 md:flex md:gap-14 md:items-center"
              >
                {/* Large accent number */}
                <div className="hidden md:block shrink-0 relative" style={{ width: '100px' }}>
                  <span
                    className="block leading-none select-none transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-1"
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      fontSize: '72px',
                      color: 'var(--color-accent)',
                      letterSpacing: '-0.03em',
                      opacity: 0.15,
                    }}
                    aria-hidden="true"
                  >
                    0{i + 1}
                  </span>
                </div>

                {/* Content */}
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
                    {formatDate(post.publishedAt, locale)}
                  </time>

                  <h3
                    className="uppercase mb-3 transition-colors duration-300 group-hover:text-[var(--color-accent)]"
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'clamp(22px, 3.5vw, 40px)',
                      fontWeight: 700,
                      color: 'var(--color-ink)',
                      lineHeight: 0.95,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {localizedTitle(post, locale)}
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
                    {localizedExcerpt(post, locale)}
                  </p>
                </div>

                {/* Arrow */}
                <span
                  className="hidden md:block shrink-0 transition-all duration-300 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '24px',
                    fontWeight: 700,
                    color: 'var(--color-accent)',
                  }}
                  aria-hidden="true"
                >
                  →
                </span>
              </Link>
            </article>
          </FadeIn>
        ))}
      </div>

    </section>
  );
}
