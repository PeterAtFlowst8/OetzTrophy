'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import type { RegistrationRecord } from '@/lib/db';
import {
  buildUnpaidMailto,
  filterAndSortRegistrations,
  isTestRow,
  isUnpaid,
  type CategoryFilter,
  type RegSort,
  type RegSortKey,
  type RegStatusFilter,
} from '@/lib/adminTable';
import {
  CategoryBadge,
  MailIcon,
  SearchIcon,
  SortHeader,
  StatusBadge,
  formatViennaDateTime,
  rowBgForStatus,
  td,
  th,
} from './ui';

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
const selectStyle: CSSProperties = {
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface)',
  padding: '7px 10px',
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  color: 'var(--color-ink)',
};
const labelStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  color: 'var(--color-body-text)',
  cursor: 'pointer',
};

export default function RegistrationsTable({ rows }: { rows: RegistrationRecord[] }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [status, setStatus] = useState<RegStatusFilter>('all');
  const [hideTest, setHideTest] = useState(false);
  const [sort, setSort] = useState<RegSort>({ key: 'createdAt', dir: 'desc' });
  const [origin, setOrigin] = useState('');

  useEffect(() => setOrigin(window.location.origin), []);

  const visible = useMemo(
    () => filterAndSortRegistrations(rows, { query, category, status, hideTest }, sort),
    [rows, query, category, status, hideTest, sort],
  );

  function toggleSort(key: RegSortKey) {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: key === 'createdAt' ? 'desc' : 'asc' },
    );
  }

  const sortState = (key: RegSortKey): 'none' | 'asc' | 'desc' => (sort.key === key ? sort.dir : 'none');

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
            aria-label="Search registrations by name or email"
            style={inputStyle}
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as CategoryFilter)}
          aria-label="Filter by category"
          style={selectStyle}
        >
          <option value="all">All categories</option>
          <option value="men">Men</option>
          <option value="women">Women</option>
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as RegStatusFilter)}
          aria-label="Filter by status"
          style={selectStyle}
        >
          <option value="all">All statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="expired">Expired</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <label style={labelStyle}>
          <input type="checkbox" checked={hideTest} onChange={(e) => setHideTest(e.target.checked)} />
          Hide test
        </label>

        <span
          style={{ marginLeft: 'auto', fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-muted)' }}
        >
          Showing {visible.length} of {rows.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <SortHeader label="Name" state={sortState('name')} onClick={() => toggleSort('name')} />
              <SortHeader label="Email" state={sortState('email')} onClick={() => toggleSort('email')} />
              <SortHeader label="Nationality" state={sortState('nationality')} onClick={() => toggleSort('nationality')} />
              <th style={th}>T-shirt</th>
              <SortHeader label="Category" state={sortState('category')} onClick={() => toggleSort('category')} />
              <SortHeader label="Status" state={sortState('status')} onClick={() => toggleSort('status')} />
              <SortHeader label="Created" state={sortState('createdAt')} onClick={() => toggleSort('createdAt')} />
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td
                  style={{ ...td, textAlign: 'center', padding: '32px 12px', color: 'var(--color-muted)' }}
                  colSpan={8}
                >
                  No registrations match these filters.
                </td>
              </tr>
            ) : (
              visible.map((r) => (
                <tr key={r.id} style={rowBgForStatus(r.status)}>
                  <td style={td}>
                    {r.name}
                    {isTestRow(r.stripeSessionId) && (
                      <span
                        className="ml-2 px-2 py-0.5 uppercase"
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '10px',
                          fontWeight: 700,
                          backgroundColor: '#7c2d12',
                          color: '#ffedd5',
                        }}
                      >
                        Test
                      </span>
                    )}
                  </td>
                  <td style={td}>{r.email}</td>
                  <td style={td}>{r.nationality ?? <span style={{ color: 'var(--color-muted)' }}>—</span>}</td>
                  <td style={td}>{r.tshirtSize ?? <span style={{ color: 'var(--color-muted)' }}>—</span>}</td>
                  <td style={td}>
                    <CategoryBadge value={r.category} />
                  </td>
                  <td style={td}>
                    <StatusBadge status={r.status} />
                  </td>
                  <td style={td}>{formatViennaDateTime(r.createdAt)}</td>
                  <td style={td}>
                    {isUnpaid(r.status) ? (
                      <a
                        href={buildUnpaidMailto(r, origin)}
                        title="Open your mail app with a payment-reminder draft (links to the registration page)"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          border: '1px solid var(--color-ink)',
                          padding: '3px 9px',
                          fontFamily: 'var(--font-display)',
                          fontSize: '12px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: 'var(--color-ink)',
                          textDecoration: 'none',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <MailIcon size={13} />
                        Email
                      </a>
                    ) : (
                      <span style={{ color: 'var(--color-muted)' }}>—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
