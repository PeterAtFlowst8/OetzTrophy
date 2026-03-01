import Image from 'next/image';
import { sponsors } from '@/lib/sponsors';

export default function Sponsors() {
  return (
    <section className="py-16 bg-white border-t" style={{ borderColor: 'var(--color-border)' }}>
      <div className="max-w-5xl mx-auto px-5 md:px-10">

        <p
          className="uppercase tracking-widest mb-10 text-center"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            letterSpacing: '0.2em',
            color: 'var(--color-muted)',
          }}
        >
          Partner &amp; Sponsoren
        </p>

        <div className="flex flex-wrap items-center justify-center gap-10 md:gap-14">
          {sponsors.map((sponsor) => (
            <a
              key={sponsor.name}
              href={sponsor.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block transition-all duration-300 opacity-40 hover:opacity-100 grayscale hover:grayscale-0"
              title={sponsor.name}
            >
              <Image
                src={sponsor.logoUrl}
                alt={sponsor.name}
                width={120}
                height={60}
                className="h-10 w-auto object-contain"
              />
            </a>
          ))}
        </div>

      </div>
    </section>
  );
}
