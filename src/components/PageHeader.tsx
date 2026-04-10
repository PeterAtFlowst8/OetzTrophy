const GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`;

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
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${image}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/25" />
        </>
      )}

      {/* Grain texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: GRAIN,
          backgroundSize: '200px 200px',
          opacity: 0.06,
          mixBlendMode: 'overlay',
        }}
      />

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
        style={{ minHeight: 'inherit' }}
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
            fontSize: 'clamp(36px, 8vw, 80px)',
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
