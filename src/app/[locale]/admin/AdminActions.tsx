'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminActions() {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [sweeping, setSweeping] = useState(false);

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.refresh();
  }

  async function handleDeleteTest() {
    if (!window.confirm('Delete ALL test registrations (cs_test_…)? This cannot be undone.')) return;
    setDeleting(true);
    try {
      const res = await fetch('/api/admin/delete-test', { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        window.alert(`Deleted ${data?.deleted?.registrations ?? 0} registration(s) and ${data?.deleted?.waitlist ?? 0} waitlist row(s).`);
        router.refresh();
      } else {
        window.alert(data?.error ?? 'Delete failed.');
      }
    } finally {
      setDeleting(false);
    }
  }

  async function handleSweep(dryRun: boolean) {
    if (
      !dryRun &&
      !window.confirm(
        'Run the pending-payment sweep FOR REAL? This sends reminder emails and expires registrations left unpaid for 4+ days.',
      )
    )
      return;
    setSweeping(true);
    try {
      const res = await fetch('/api/admin/pending-sweep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dryRun }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        const s = data?.summary ?? {};
        window.alert(
          `${dryRun ? 'DRY RUN — would' : 'Done —'} scan ${s.scanned ?? 0}, recover ${s.reconciledPaid ?? 0} paid, send ${s.remindersSent ?? 0} reminder(s), expire ${s.expired ?? 0}.`,
        );
        router.refresh();
      } else {
        window.alert(data?.error ?? 'Sweep failed.');
      }
    } finally {
      setSweeping(false);
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
        disabled={deleting}
        className="px-5 py-2 uppercase disabled:opacity-50"
        style={{ ...buttonStyle, backgroundColor: '#7c2d12', color: '#ffedd5', cursor: deleting ? 'wait' : 'pointer' }}
      >
        {deleting ? 'Deleting…' : 'Delete test data'}
      </button>
      <button
        type="button"
        onClick={() => handleSweep(true)}
        disabled={sweeping}
        className="px-5 py-2 uppercase disabled:opacity-50"
        style={{ ...buttonStyle, backgroundColor: 'transparent', color: 'var(--color-ink)', cursor: sweeping ? 'wait' : 'pointer' }}
        title="Reconcile unpaid registrations against Stripe and preview reminders/expiry — no changes made"
      >
        {sweeping ? 'Sweeping…' : 'Sweep (dry run)'}
      </button>
      <button
        type="button"
        onClick={() => handleSweep(false)}
        disabled={sweeping}
        className="px-5 py-2 uppercase disabled:opacity-50"
        style={{ ...buttonStyle, backgroundColor: '#f59e0b', color: '#1c1917', cursor: sweeping ? 'wait' : 'pointer' }}
        title="Send due reminders and expire 4+ day unpaid registrations"
      >
        Sweep (live)
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
