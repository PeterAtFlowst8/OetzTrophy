'use client';

import { useRouter } from 'next/navigation';

export default function AdminActions() {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.refresh();
  }

  const buttonStyle: React.CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontSize: '16px',
    fontWeight: 700,
    border: '1px solid var(--color-ink)',
    cursor: 'pointer',
  };

  return (
    <div className="flex gap-3">
      <a
        href="/api/admin/export"
        className="px-5 py-2 uppercase"
        style={{ ...buttonStyle, backgroundColor: 'var(--color-ink)', color: 'white' }}
      >
        Download CSV
      </a>
      <button
        type="button"
        onClick={handleLogout}
        className="px-5 py-2 uppercase"
        style={{ ...buttonStyle, backgroundColor: 'transparent', color: 'var(--color-ink)' }}
      >
        Log out
      </button>
    </div>
  );
}
