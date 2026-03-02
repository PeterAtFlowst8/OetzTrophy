import Image from 'next/image';
import { sponsors } from '@/lib/sponsors';

export default function Sponsors() {
  return (
    <section
      className="py-16 md:py-20"
      style={{
        backgroundColor: 'var(--color-background)',
        borderTop: '1px solid var(--color-border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">

        <p
          className="uppercase mb-10 md:mb-14"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            letterSpacing: '0.25em',
            color: 'var(--color-muted)',
          }}
        >
          Partner &amp; Sponsoren
        </p>

        <div className="flex flex-wrap items-center gap-10 md:gap-16">
          {sponsors.map((sponsor) => (
            <a
              key={sponsor.name}
              href={sponsor.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block transition-all duration-300 opacity-60 grayscale hover:opacity-100 hover:grayscale-0"
              title={sponsor.name}
            >
              <Image
                src={sponsor.logoUrl}
                alt={sponsor.name}
                width={140}
                height={70}
                className="h-12 w-auto object-contain"
              />
            </a>
          ))}
        </div>

      </div>
    </section>
  );
}
