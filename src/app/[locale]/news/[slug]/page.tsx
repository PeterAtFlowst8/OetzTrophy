import type { Metadata } from 'next';
import { getTranslations, getLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { PortableText } from '@portabletext/react';
import PageHeader from '@/components/PageHeader';
import FadeIn from '@/components/motion/FadeIn';
import { Link } from '@/i18n/navigation';
import { getPostBySlug, localizedTitle, localizedExcerpt, localizedBody, formatDate } from '@/lib/news';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const post = await getPostBySlug(slug);
  if (!post) return { title: 'Article Not Found' };

  return {
    title: localizedTitle(post, locale),
    description: localizedExcerpt(post, locale),
  };
}

export const revalidate = 60;

const portableTextComponents = {
  block: {
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2
        className="uppercase mt-10 mb-4"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(24px, 3vw, 32px)',
          fontWeight: 700,
          color: 'var(--color-ink)',
          lineHeight: 1,
        }}
      >
        {children}
      </h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3
        className="uppercase mt-8 mb-3"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '20px',
          fontWeight: 700,
          color: 'var(--color-ink)',
        }}
      >
        {children}
      </h3>
    ),
    normal: ({ children }: { children?: React.ReactNode }) => (
      <p
        className="mb-5"
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '16px',
          lineHeight: 1.8,
          color: 'var(--color-body-text)',
        }}
      >
        {children}
      </p>
    ),
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote
        className="my-6 pl-5"
        style={{
          borderLeft: '3px solid var(--color-accent)',
          fontStyle: 'italic',
          color: 'var(--color-muted)',
        }}
      >
        {children}
      </blockquote>
    ),
  },
};

export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params;
  const t = await getTranslations('news');
  const locale = await getLocale();

  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const title = localizedTitle(post, locale);
  const body = localizedBody(post, locale);

  return (
    <main>
      <PageHeader label={t('label')} title={title} />

      <section className="py-16 md:py-24" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="max-w-3xl mx-auto px-6 md:px-12">

          <FadeIn>
            <time
              className="block uppercase mb-8"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                letterSpacing: '0.2em',
                color: 'var(--color-muted)',
              }}
            >
              {formatDate(post.publishedAt, locale)}
            </time>

            {body && body.length > 0 ? (
              <PortableText value={body} components={portableTextComponents} />
            ) : (
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '18px',
                  lineHeight: 1.8,
                  color: 'var(--color-body-text)',
                }}
              >
                {localizedExcerpt(post, locale)}
              </p>
            )}
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
