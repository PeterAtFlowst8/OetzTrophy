import { getTranslations } from 'next-intl/server';

const itemStyle: React.CSSProperties = {
  display: 'inline-block',
  fontFamily: 'var(--font-display)',
  fontWeight: 700,
  fontSize: '13px',
  letterSpacing: '0.22em',
  color: '#111111',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
  padding: '0 2.5rem',
};

const dotStyle: React.CSSProperties = {
  display: 'inline-block',
  color: '#111111',
  opacity: 0.3,
  padding: '0 0.25rem',
  fontFamily: 'var(--font-body)',
};

export default async function MarqueeBanner() {
  const t = await getTranslations('marquee');
  const items = [0, 1, 2, 3, 4, 5].map((i) => t(`item${i}` as Parameters<typeof t>[0]));

  function Track() {
    return (
      <>
        {items.map((item) => (
          <span key={item}>
            <span style={itemStyle}>{item}</span>
            <span style={dotStyle}>·</span>
          </span>
        ))}
      </>
    );
  }

  return (
    <div
      className="w-full"
      style={{
        backgroundColor: 'var(--color-accent)',
        overflow: 'clip',
        padding: '11px 0',
      }}
    >
      <div
        style={{
          display: 'flex',
          width: 'max-content',
          animation: 'marquee 32s linear infinite',
          willChange: 'transform',
        }}
      >
        <Track />
        <Track />
      </div>
    </div>
  );
}
