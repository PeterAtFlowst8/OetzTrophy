import type { Metadata } from 'next';
import { isAdminAuthenticated } from '@/lib/admin-auth-server';
import { listRegistrations } from '@/lib/db';
import AdminLogin from './AdminLogin';
import AdminActions from './AdminActions';

export const dynamic = 'force-dynamic'; // PII — never cache, always re-check the cookie

export const metadata: Metadata = {
  title: 'Registrations admin — OETZ TROPHY',
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const authed = await isAdminAuthenticated();

  if (!authed) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <AdminLogin />
      </main>
    );
  }

  const registrations = await listRegistrations();
  const paid = registrations.filter((r) => r.status === 'paid');
  const isTestRow = (sessionId: string | null) => sessionId?.startsWith('cs_test_') ?? false;

  const th: React.CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontSize: '13px',
    fontWeight: 700,
    textAlign: 'left',
    padding: '10px 12px',
    borderBottom: '2px solid var(--color-ink)',
    textTransform: 'uppercase',
  };
  const td: React.CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontSize: '13px',
    padding: '8px 12px',
    borderBottom: '1px solid var(--color-border)',
    verticalAlign: 'top',
  };

  return (
    <main className="min-h-screen px-6 py-16 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1
            className="uppercase"
            style={{ fontFamily: 'var(--font-display)', fontSize: '34px', fontWeight: 700 }}
          >
            Registrations
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-body-text)' }}>
            {registrations.length} total · {paid.length} paid ·{' '}
            {registrations.length - paid.length} pending
          </p>
        </div>
        <AdminActions />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>ID</th>
              <th style={th}>Name</th>
              <th style={th}>Email</th>
              <th style={th}>Nationality</th>
              <th style={th}>T-shirt</th>
              <th style={th}>Status</th>
              <th style={th}>Created</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((r) => (
              <tr key={r.id} style={r.status === 'paid' ? { backgroundColor: '#f0fdf4' } : undefined}>
                <td style={td}>{r.id}</td>
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
                <td style={td}>{r.nationality}</td>
                <td style={td}>{r.tshirtSize}</td>
                <td style={td}>{r.status}</td>
                <td style={td}>{new Date(r.createdAt).toLocaleString('de-AT')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
