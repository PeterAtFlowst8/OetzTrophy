import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import PageHeader from '@/components/PageHeader';
import { allPosts } from '@/lib/news';

const meta = {
  de: { title: 'News', description: 'Neuigkeiten und Berichte rund um die OETZ TROPHY, das Kajakfestival und den Boater X auf der Ötztaler Ache.' },
  en: { title: 'News', description: 'News and reports about the OETZ TROPHY, the Kayak Festival, and Boater X on the Ötztaler Ache.' },
};

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const m = meta[(locale === 'en' ? 'en' : 'de') as keyof typeof meta];
  return { title: m.title, description: m.description };
}

export default async function NewsPage() {
  const t = await getTranslations('news');

  return (
    <main>
      <PageHeader label={t('label')} title={t('headline')} />

      <section style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="max-w-5xl mx-auto px-6 md:px-12 py-16 md:py-24">
          {allPosts.map((post, i) => (
            <article
              key={post.slug}
              className="group"
              style={{ borderBottom: '1px solid var(--color-border)' }}
            >
              <div className="py-8 md:py-10 flex gap-5 md:gap-10 items-start">
                <span
                  className="shrink-0 leading-none select-none hidden md:block"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: 'clamp(28px, 3.5vw, 48px)',
                    color: 'var(--color-accent)',
                    letterSpacing: '-0.02em',
                    opacity: 0.9,
                    minWidth: '2.5ch',
                  }}
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, '0')}
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

                  <h2
                    className="uppercase mb-3 transition-colors duration-200 group-hover:text-[var(--color-accent)]"
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'clamp(22px, 3vw, 36px)',
                      fontWeight: 700,
                      color: 'var(--color-ink)',
                      lineHeight: 0.95,
                    }}
                  >
                    {post.title}
                  </h2>

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
          ))}
        </div>
      </section>
    </main>
  );
}
