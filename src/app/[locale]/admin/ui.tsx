// Presentational building blocks for the admin tables: shared cell styles,
// inline-SVG icons (no dependency), and Category/Status badges. No hooks here,
// so this is safe to import from both the server page and the client tables.
import type { CSSProperties } from 'react';

// ─── Shared table cell styles (moved from page.tsx) ─────────────────────────
export const th: CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: '13px',
  fontWeight: 700,
  textAlign: 'left',
  padding: '10px 12px',
  borderBottom: '2px solid var(--color-ink)',
  textTransform: 'uppercase',
};

export const td: CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  padding: '8px 12px',
  borderBottom: '1px solid var(--color-border)',
  verticalAlign: 'top',
};

export function rowBgForStatus(status: string): CSSProperties | undefined {
  if (status === 'paid') return { backgroundColor: '#f0fdf4' };
  if (status === 'expired' || status === 'cancelled') return { backgroundColor: '#fafaf9', color: '#a8a29e' };
  return undefined;
}

export function formatViennaDateTime(iso: string): string {
  return new Date(iso).toLocaleString('de-AT', { timeZone: 'Europe/Vienna' });
}

// ─── Inline SVG icons (stroke = currentColor, no dependency) ─────────────────
type IconProps = { size?: number };

function strokeProps(size: number) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
}

export function MailIcon({ size = 14 }: IconProps) {
  return (
    <svg {...strokeProps(size)}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m2 6 10 7 10-7" />
    </svg>
  );
}

export function SearchIcon({ size = 14 }: IconProps) {
  return (
    <svg {...strokeProps(size)}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function CheckCircleIcon({ size = 14 }: IconProps) {
  return (
    <svg {...strokeProps(size)}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </svg>
  );
}

export function ClockIcon({ size = 14 }: IconProps) {
  return (
    <svg {...strokeProps(size)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function XCircleIcon({ size = 14 }: IconProps) {
  return (
    <svg {...strokeProps(size)}>
      <circle cx="12" cy="12" r="9" />
      <path d="m9 9 6 6m0-6-6 6" />
    </svg>
  );
}

/** Sort indicator: faint when inactive, highlighting the active direction. */
export function SortIcon({ state }: { state: 'none' | 'asc' | 'desc' }) {
  const up = state === 'asc' ? 1 : 0.25;
  const down = state === 'desc' ? 1 : 0.25;
  return (
    <svg width={12} height={12} viewBox="0 0 16 16" fill="currentColor" aria-hidden style={{ flexShrink: 0 }}>
      <path d="M8 2 L11.5 6 L4.5 6 Z" opacity={up} />
      <path d="M8 14 L4.5 10 L11.5 10 Z" opacity={down} />
    </svg>
  );
}

/** A clickable, sortable column header. Module-level (not nested in a table
 *  component) so React updates it in place instead of remounting on every render. */
export function SortHeader({
  label,
  state,
  onClick,
}: {
  label: string;
  state: 'none' | 'asc' | 'desc';
  onClick: () => void;
}) {
  return (
    <th style={th}>
      <button
        type="button"
        onClick={onClick}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          font: 'inherit',
          textTransform: 'inherit',
          color: 'inherit',
        }}
      >
        {label}
        <SortIcon state={state} />
      </button>
    </th>
  );
}

// ─── Badges ──────────────────────────────────────────────────────────────────
const badgeBase: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  fontFamily: 'var(--font-display)',
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.02em',
  padding: '2px 8px',
  lineHeight: 1.5,
  whiteSpace: 'nowrap',
};

export function CategoryBadge({ value }: { value: string | null }) {
  if (value === 'men') {
    return <span style={{ ...badgeBase, backgroundColor: '#eff6ff', color: '#1d4ed8' }}>Men</span>;
  }
  if (value === 'women') {
    return <span style={{ ...badgeBase, backgroundColor: '#fdf2f8', color: '#be185d' }}>Women</span>;
  }
  return <span style={{ color: 'var(--color-muted)' }}>—</span>;
}

export function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
    paid: { bg: '#f0fdf4', color: '#15803d', icon: <CheckCircleIcon size={12} /> },
    pending: { bg: '#fffbeb', color: 'var(--color-accent-text)', icon: <ClockIcon size={12} /> },
    expired: { bg: '#f5f5f4', color: '#78716c', icon: <XCircleIcon size={12} /> },
    cancelled: { bg: '#f5f5f4', color: '#78716c', icon: <XCircleIcon size={12} /> },
  };
  const v = variants[status] ?? { bg: '#f5f5f4', color: '#57534e', icon: null };
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span style={{ ...badgeBase, backgroundColor: v.bg, color: v.color }}>
      {v.icon}
      {label}
    </span>
  );
}
