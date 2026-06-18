import type { Metadata } from 'next';
import { isAdminAuthenticated } from '@/lib/admin-auth-server';
import { listRegistrations, listWaitlist } from '@/lib/db';
import { getSiteSettings } from '@/lib/settings';
import { resolveCaps } from '@/lib/capacity';
import { countPaidByCategory } from '@/lib/adminTable';
import AdminLogin from './AdminLogin';
import AdminActions from './AdminActions';
import RegistrationsTable from './RegistrationsTable';
import WaitlistTable from './WaitlistTable';

export const dynamic = 'force-dynamic'; // PII — never cache, always re-check the cookie

export const metadata: Metadata = {
  title: 'Registrations admin — OETZ TROPHY',
  robots: { index: false, follow: false },
};

function CapacityMeter({ label, paid, cap }: { label: string; paid: number; cap: number }) {
  const pct = cap > 0 ? Math.min(100, Math.round((paid / cap) * 100)) : 0;
  const full = cap > 0 && paid >= cap;
  return (
    <div style={{ minWidth: '180px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: 'var(--font-display)',
          fontSize: '13px',
          fontWeight: 700,
          textTransform: 'uppercase',
          marginBottom: '4px',
        }}
      >
        <span>{label}</span>
        <span style={{ color: full ? '#b91c1c' : 'var(--color-body-text)' }}>
          {paid}/{cap}
          {cap === 0 ? ' · closed' : full ? ' · full' : ''}
        </span>
      </div>
      <div style={{ height: '6px', background: 'var(--color-border)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: full ? '#b91c1c' : 'var(--color-accent)' }} />
      </div>
    </div>
  );
}

export default async function AdminPage() {
  const authed = await isAdminAuthenticated();

  if (!authed) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <AdminLogin />
      </main>
    );
  }

  const [registrations, waitlist, settings] = await Promise.all([
    listRegistrations(),
    listWaitlist(),
    getSiteSettings(),
  ]);
  const caps = resolveCaps(settings);
  const paidByCategory = countPaidByCategory(registrations);
  const counts = {
    total: registrations.length,
    paid: registrations.filter((r) => r.status === 'paid').length,
    pending: registrations.filter((r) => r.status === 'pending').length,
    expired: registrations.filter((r) => r.status === 'expired').length,
    cancelled: registrations.filter((r) => r.status === 'cancelled').length,
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
            {counts.total} total · {counts.paid} paid · {counts.pending} pending
            {counts.expired > 0 ? ` · ${counts.expired} expired` : ''}
            {counts.cancelled > 0 ? ` · ${counts.cancelled} cancelled` : ''}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', marginTop: '14px' }}>
            <CapacityMeter label="Men" paid={paidByCategory.men} cap={caps.men} />
            <CapacityMeter label="Women" paid={paidByCategory.women} cap={caps.women} />
          </div>
        </div>
        <AdminActions />
      </div>

      <RegistrationsTable rows={registrations} />

      <h2
        className="uppercase mt-14 mb-3"
        style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 700 }}
      >
        Waiting list
      </h2>
      <p className="mb-4" style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-body-text)' }}>
        {waitlist.length} total · {waitlist.filter((w) => w.category === 'men').length} men ·{' '}
        {waitlist.filter((w) => w.category === 'women').length} women
      </p>
      <WaitlistTable rows={waitlist} />
    </main>
  );
}
