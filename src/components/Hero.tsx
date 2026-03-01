export default function Hero() {
  return (
    <section className="relative w-full h-screen min-h-[600px] overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/hero.jpg')" }}
      />

      {/* Grain texture overlay for cinematic depth */}
      <div
        className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      {/* Bottom gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

      {/* Hero content — pinned bottom-left */}
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-12 md:px-12 md:pb-16 max-w-5xl">
        {/* Badge — animates in first */}
        <span
          className="inline-block mb-5 px-3 py-1 text-xs font-bold uppercase tracking-widest hero-badge"
          style={{
            backgroundColor: 'var(--color-accent)',
            color: '#111',
            borderRadius: '4px',
            transform: 'rotate(-2deg)',
            transformOrigin: 'left center',
            boxShadow: '2px 2px 12px rgba(0,0,0,0.3)',
            display: 'inline-block',
          }}
        >
          Invite Only · 2026
        </span>

        {/* Main headline — each line animates in sequentially */}
        <h1
          className="block leading-none uppercase text-white"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 0.92,
          }}
        >
          <span className="block hero-line-1" style={{ fontSize: 'clamp(60px, 10vw, 140px)' }}>Extreme</span>
          <span className="block hero-line-2" style={{ fontSize: 'clamp(60px, 10vw, 140px)' }}>Kayak</span>
          <span className="block hero-line-3" style={{ fontSize: 'clamp(60px, 10vw, 140px)' }}>Championships</span>
        </h1>

        {/* Location — animates in last */}
        <p
          className="mt-5 uppercase tracking-widest text-white/70 hero-location"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            letterSpacing: '0.25em',
          }}
        >
          Oetz · Tirol · Österreich
        </p>
      </div>

      {/* Scroll indicator — fades out after 3s */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hero-scroll-indicator"
        aria-hidden="true"
      >
        <div
          className="w-px h-12 mx-auto"
          style={{
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.6), transparent)',
          }}
        />
      </div>
    </section>
  );
}
