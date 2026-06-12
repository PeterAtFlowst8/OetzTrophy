'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('Network error — please try again');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm w-full">
      <label
        htmlFor="admin-password"
        className="block mb-2 uppercase"
        style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700 }}
      >
        Admin password
      </label>
      <input
        id="admin-password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoFocus
        className="w-full px-4 py-3 mb-4"
        style={{ border: '1px solid var(--color-border)', fontFamily: 'var(--font-body)' }}
      />
      {error && (
        <p className="mb-4" style={{ color: '#b91c1c', fontFamily: 'var(--font-body)', fontSize: '14px' }}>
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy || !password}
        className="w-full py-3 uppercase disabled:opacity-45"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '18px',
          fontWeight: 700,
          backgroundColor: 'var(--color-ink)',
          color: 'white',
          border: 'none',
          cursor: busy ? 'wait' : 'pointer',
        }}
      >
        {busy ? '…' : 'Log in'}
      </button>
    </form>
  );
}
