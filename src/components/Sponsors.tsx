import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { getSponsors } from '@/lib/sponsors';
import FadeIn from '@/components/motion/FadeIn';
import { StaggerContainer, StaggerItem } from '@/components/motion/StaggerChildren';

export const revalidate = 60;

export default async function Sponsors() {
  const t = await getTranslations('sponsors');
  const sponsors = await getSponsors();

  if (sponsors.length === 0) return null;

  return (
    <section className="relative py-20 md:py-28" style={{ backgroundColor: 'var(--color-background)' }}>

      {/* Decorative top border with accent dash */}
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex items-center gap-4 mb-14 md:mb-20">
          <div style={{ width: '40px', height: '3px', backgroundColor: 'var(--color-accent)' }} />
          <FadeIn>
            <p
              className="uppercase"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                letterSpacing: '0.25em',
                color: 'var(--color-muted)',
              }}
            >
              {t('label')}
            </p>
          </FadeIn>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <StaggerContainer className="flex flex-wrap items-center justify-center gap-12 md:gap-16" stagger={0.1}>
          {sponsors.map((sponsor) => (
            <StaggerItem key={sponsor.name}>
              <a
                href={sponsor.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group block transition-all duration-500 opacity-40 grayscale hover:opacity-100 hover:grayscale-0 hover:scale-105"
                title={sponsor.name}
              >
                <Image
                  src={sponsor.logoUrl}
                  alt={sponsor.name}
                  width={140}
                  height={70}
                  className="h-10 md:h-14 w-auto object-contain"
                />
              </a>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>

    </section>
  );
}
