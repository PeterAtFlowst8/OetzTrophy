'use client';

import { useRouter } from 'next/navigation';

export default function AdminActions() {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.refresh();
  }

  async function handleDeleteTest() {
    if (!window.confirm('Delete ALL test registrations (cs_test_…)? This cannot be undone.')) return;
    const res = await fetch('/api/admin/delete-test', { method: 'POST' });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      window.alert(`Deleted ${data?.deleted?.registrations ?? 0} test registration(s).`);
      router.refresh();
    } else {
      window.alert('Delete failed.');
    }
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
      <button
        type="button"
        onClick={handleDeleteTest}
        className="px-5 py-2 uppercase"
        style={{ ...buttonStyle, backgroundColor: '#7c2d12', color: '#ffedd5' }}
      >
        Delete test data
      </button>
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
