'use client';

import { useMemo, useState, type CSSProperties } from 'react';
import type { VolunteerRecord } from '@/lib/db';
import { roleLabel, dayLabel } from '@/lib/volunteerLabels';
import { SearchIcon, MailIcon, formatViennaDateTime, td, th } from './ui';

const controlBox: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface)',
  padding: '6px 10px',
};
const inputStyle: CSSProperties = {
  border: 'none',
  outline: 'none',
  background: 'transparent',
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  minWidth: '200px',
  color: 'var(--color-ink)',
};

export default function VolunteersTable({ rows }: { rows: VolunteerRecord[] }) {
  const [query, setQuery] = useState('');
  const [hideTest, setHideTest] = useState(false);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (hideTest && r.isTest) return false;
      if (!q) return true;
      return `${r.firstName} ${r.lastName}`.toLowerCase().includes(q) || r.email.toLowerCase().includes(q);
    });
  }, [rows, query, hideTest]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div style={controlBox}>
          <SearchIcon size={16} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or email…"
            aria-label="Search volunteers by name or email"
            style={inputStyle}
          />
        </div>

        <label
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            color: 'var(--color-body-text)',
          }}
        >
          <input
            type="checkbox"
            checked={hideTest}
            onChange={(e) => setHideTest(e.target.checked)}
            style={{ accentColor: 'var(--color-accent)' }}
          />
          Hide test
        </label>

        <a
          href="/api/admin/volunteers-export"
          style={{ ...controlBox, textDecoration: 'none', color: 'var(--color-ink)', fontFamily: 'var(--font-body)', fontSize: '14px' }}
        >
          Download CSV
        </a>

        <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-muted)' }}>
          Showing {visible.length} of {rows.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Name</th>
              <th style={th}>Email</th>
              <th style={th}>T-shirt</th>
              <th style={th}>Roles</th>
              <th style={th}>Availability</th>
              <th style={th}>Signed up</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td style={{ ...td, textAlign: 'center', padding: '32px 12px', color: 'var(--color-muted)' }} colSpan={6}>
                  No volunteers match these filters.
                </td>
              </tr>
            ) : (
              visible.map((v) => (
                <tr key={v.id} style={v.isTest ? { backgroundColor: '#fafaf9', color: '#a8a29e' } : undefined}>
                  <td style={td}>
                    {v.firstName} {v.lastName}
                    {v.isTest ? ' · test' : ''}
                  </td>
                  <td style={td}>
                    <a
                      href={`mailto:${v.email}`}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-accent-text)', textDecoration: 'none' }}
                    >
                      <MailIcon size={13} />
                      {v.email}
                    </a>
                  </td>
                  <td style={td}>{v.tshirtSize || '—'}</td>
                  <td style={td}>{v.roles.length ? v.roles.map(roleLabel).join(', ') : '—'}</td>
                  <td style={td}>{v.availability.length ? v.availability.map(dayLabel).join(', ') : '—'}</td>
                  <td style={td}>{formatViennaDateTime(v.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
