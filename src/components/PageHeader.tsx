import Image from 'next/image';
import { headingFontSize } from '@/lib/headingFit';

type Props = {
  label?: string;
  title: string;
  image?: string;
};

export default function PageHeader({ label, title, image }: Props) {
  return (
    <header
      className="relative overflow-hidden"
      style={{
        minHeight: image ? '60vh' : '320px',
        backgroundColor: 'var(--color-ink)',
      }}
    >
      {image && (
        <>
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover object-center"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/25" />
        </>
      )}

      {/* Gradient for text-only headers */}
      {!image && (
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #111 0%, #1a1a1a 50%, #222 100%)',
          }}
        />
      )}

      {/* Decorative accent line */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{ height: '4px', backgroundColor: 'var(--color-accent)' }}
      />

      <div
        className="relative max-w-7xl mx-auto px-6 md:px-12 flex flex-col justify-end h-full pb-12 md:pb-16"
        style={{ minHeight: 'inherit', containerType: 'inline-size' }}
      >
        {label && (
          <p
            className="uppercase mb-3"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              letterSpacing: '0.25em',
              color: 'var(--color-accent)',
            }}
          >
            {label}
          </p>
        )}
        <h1
          className="uppercase leading-none"
          style={{
            fontFamily: 'var(--font-display)',
            // Full design scale for normal titles; long single-word titles
            // (e.g. "Teilnahmebedingungen") get a per-title cap so they shrink
            // just enough to fit the column (cqi, container on the wrapper).
            fontSize: headingFontSize(title, { floorPx: 36, slopeCqi: 8, capPx: 80 }),
            fontWeight: 700,
            color: 'white',
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </h1>
      </div>
    </header>
  );
}
