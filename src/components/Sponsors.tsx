import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { sponsors } from '@/lib/sponsors';

export default async function Sponsors() {
  const t = await getTranslations('sponsors');

  return (
    <section
      className="py-20 md:py-28"
      style={{
        backgroundColor: 'var(--color-background)',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">

        <p
          className="uppercase text-center mb-12 md:mb-16"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            letterSpacing: '0.25em',
            color: 'var(--color-muted)',
          }}
        >
          {t('label')}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-10 md:gap-14">
          {sponsors.map((sponsor) => (
            <a
              key={sponsor.name}
              href={sponsor.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block transition-all duration-300 opacity-50 grayscale hover:opacity-100 hover:grayscale-0"
              title={sponsor.name}
            >
              <Image
                src={sponsor.logoUrl}
                alt={sponsor.name}
                width={140}
                height={70}
                className="h-10 md:h-12 w-auto object-contain"
              />
            </a>
          ))}
        </div>

      </div>
    </section>
  );
}
