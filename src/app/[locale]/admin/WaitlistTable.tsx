'use client';

import { useMemo, useState, type CSSProperties } from 'react';
import type { WaitlistRecord } from '@/lib/db';
import {
  filterAndSortWaitlist,
  type CategoryFilter,
  type WaitlistSort,
  type WaitlistSortKey,
} from '@/lib/adminTable';
import { CategoryBadge, SearchIcon, SortHeader, formatViennaDateTime, td, th } from './ui';

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

export default function WaitlistTable({ rows }: { rows: WaitlistRecord[] }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [sort, setSort] = useState<WaitlistSort>({ key: 'createdAt', dir: 'asc' });

  const visible = useMemo(
    () => filterAndSortWaitlist(rows, { query, category }, sort),
    [rows, query, category, sort],
  );

  function toggleSort(key: WaitlistSortKey) {
    setSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' },
    );
  }

  const sortState = (key: WaitlistSortKey): 'none' | 'asc' | 'desc' => (sort.key === key ? sort.dir : 'none');

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
            aria-label="Search waiting list by name or email"
            style={inputStyle}
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as CategoryFilter)}
          aria-label="Filter waiting list by category"
          style={selectStyle}
        >
          <option value="all">All categories</option>
          <option value="men">Men</option>
          <option value="women">Women</option>
        </select>

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
              <th style={th}>Email</th>
              <th style={th}>Category</th>
              <SortHeader label="Joined" state={sortState('createdAt')} onClick={() => toggleSort('createdAt')} />
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td
                  style={{ ...td, textAlign: 'center', padding: '32px 12px', color: 'var(--color-muted)' }}
                  colSpan={4}
                >
                  No one on the waiting list matches these filters.
                </td>
              </tr>
            ) : (
              visible.map((w) => (
                <tr key={w.id}>
                  <td style={td}>{w.name}</td>
                  <td style={td}>{w.email}</td>
                  <td style={td}>
                    <CategoryBadge value={w.category} />
                  </td>
                  <td style={td}>{formatViennaDateTime(w.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
