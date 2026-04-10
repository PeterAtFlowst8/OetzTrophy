import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import PageHeader from '@/components/PageHeader';
import FadeIn from '@/components/motion/FadeIn';
import { Link } from '@/i18n/navigation';
import { allPosts } from '@/lib/news';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params;
  const t = await getTranslations('news');

  const post = allPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <main>
      <PageHeader label={t('label')} title={post.title} />

      <section className="py-16 md:py-24" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="max-w-3xl mx-auto px-6 md:px-12">

          <FadeIn>
            <time
              className="block uppercase mb-6"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                letterSpacing: '0.2em',
                color: 'var(--color-muted)',
              }}
            >
              {post.date}
            </time>

            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '18px',
                lineHeight: 1.8,
                color: 'var(--color-body-text)',
              }}
            >
              {post.excerpt}
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="mt-12 pt-8" style={{ borderTop: '1px solid var(--color-border)' }}>
              <Link
                href="/news"
                className="inline-flex items-center gap-2 uppercase transition-colors duration-200 hover:text-[var(--color-accent)]"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  letterSpacing: '0.18em',
                  color: 'var(--color-muted)',
                }}
              >
                ← {t('viewAll')}
              </Link>
            </div>
          </FadeIn>

        </div>
      </section>
    </main>
  );
}
