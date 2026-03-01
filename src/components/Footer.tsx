const footerLinks = [
  { label: 'Impressum', href: '/impressum' },
  { label: 'Kontakt', href: '/kontakt' },
];

const socialLinks = [
  { label: 'Instagram', href: 'https://www.instagram.com/oetz_trophy/' },
  { label: 'YouTube', href: 'https://www.youtube.com/c/OETZTROPHYExtremeKayakChampionships' },
  { label: 'Facebook', href: 'https://www.facebook.com/oetztrophy' },
];

export default function Footer() {
  return (
    <footer style={{ backgroundColor: 'var(--color-footer-bg)' }}>
      {/* Amber top accent line */}
      <div className="h-px w-full" style={{ backgroundColor: 'var(--color-accent)' }} />

      <div className="max-w-7xl mx-auto px-5 md:px-10 py-10 flex flex-col md:flex-row items-center justify-between gap-6">

        {/* Nav links */}
        <nav className="flex gap-6" aria-label="Footer Navigation">
          {footerLinks.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="uppercase tracking-wider transition-colors duration-200 hover:text-white/90"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                letterSpacing: '0.15em',
                color: 'rgba(255,255,255,0.45)',
              }}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Social + copyright */}
        <div className="flex items-center gap-5 flex-wrap justify-center">
          {socialLinks.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="uppercase tracking-wider transition-colors duration-200 hover:text-white/90"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                letterSpacing: '0.15em',
                color: 'rgba(255,255,255,0.45)',
              }}
            >
              {label}
            </a>
          ))}
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              color: 'rgba(255,255,255,0.25)',
            }}
          >
            © 2026 OETZ TROPHY
          </span>
        </div>

      </div>
    </footer>
  );
}
