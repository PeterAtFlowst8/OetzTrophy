import type { CSSProperties } from 'react';
import { isAdminAuthenticated, isAdminConfigured } from '@/lib/admin-auth';
import { getRegistrationSummary, listRegistrations, REGISTRATION_STATUSES, RegistrationStatus } from '@/lib/db';
import { loginAdmin, logoutAdmin, updateRegistration } from './actions';

export const dynamic = 'force-dynamic';

const statusLabels: Record<RegistrationStatus, string> = {
  pending: 'Pending',
  paid: 'Paid',
  test_confirmed: 'Test',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatDate(value: string | null) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Vienna',
  }).format(new Date(value));
}

function exportHref(search: string, status: RegistrationStatus | undefined) {
  const params = new URLSearchParams();
  if (search) params.set('q', search);
  if (status) params.set('status', status);
  const query = params.toString();
  return query ? `/api/admin/export?${query}` : '/api/admin/export';
}

const labelStyle: CSSProperties = {
  display: 'block',
  marginBottom: 6,
  color: 'var(--color-muted)',
  fontFamily: 'var(--font-body)',
  fontSize: 11,
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
};

const inputStyle: CSSProperties = {
  width: '100%',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface)',
  color: 'var(--color-ink)',
  fontFamily: 'var(--font-body)',
  fontSize: 14,
  padding: '11px 12px',
};

const buttonStyle: CSSProperties = {
  border: '1px solid var(--color-ink)',
  background: 'var(--color-ink)',
  color: 'white',
  fontFamily: 'var(--font-display)',
  fontSize: 18,
  fontWeight: 700,
  lineHeight: 1,
  padding: '12px 16px',
  textTransform: 'uppercase',
};

export default async function AdminPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const query = await searchParams;
  const authed = await isAdminAuthenticated();
  const configured = isAdminConfigured();
  const search = getParam(query.q)?.trim() ?? '';
  const selectedStatus = getParam(query.status);
  const status = REGISTRATION_STATUSES.includes(selectedStatus as RegistrationStatus)
    ? selectedStatus as RegistrationStatus
    : undefined;
  const error = getParam(query.error);

  if (!configured || !authed) {
    return (
      <main className="py-16 md:py-24" style={{ backgroundColor: 'var(--color-background)' }}>
        <section className="max-w-md mx-auto px-6">
          <p style={{ ...labelStyle, marginBottom: 12 }}>OETZ TROPHY</p>
          <h1
            className="uppercase mb-8"
            style={{
              color: 'var(--color-ink)',
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(42px, 7vw, 72px)',
              fontWeight: 700,
              lineHeight: 0.9,
            }}
          >
            Admin
          </h1>

          {!configured ? (
            <p style={{ color: 'var(--color-body-text)', fontFamily: 'var(--font-body)', lineHeight: 1.7 }}>
              Set ADMIN_PASSWORD in Vercel to enable the registration admin.
            </p>
          ) : (
            <form action={loginAdmin} className="flex flex-col gap-5">
              <input type="hidden" name="locale" value={locale} />
              <div>
                <label htmlFor="password" style={labelStyle}>Password</label>
                <input id="password" name="password" type="password" autoComplete="current-password" required style={inputStyle} />
              </div>
              {error === 'invalid' && (
                <p style={{ color: '#B91C1C', fontFamily: 'var(--font-body)', fontSize: 14 }}>
                  The password did not match.
                </p>
              )}
              <button type="submit" style={buttonStyle}>Sign in</button>
            </form>
          )}
        </section>
      </main>
    );
  }

  const [registrations, summary] = await Promise.all([
    listRegistrations({ search, status }),
    getRegistrationSummary(),
  ]);

  return (
    <main className="py-12 md:py-16" style={{ backgroundColor: 'var(--color-background)' }}>
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
          <div>
            <p style={{ ...labelStyle, marginBottom: 10 }}>OETZ TROPHY</p>
            <h1
              className="uppercase"
              style={{
                color: 'var(--color-ink)',
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(42px, 7vw, 76px)',
                fontWeight: 700,
                lineHeight: 0.9,
              }}
            >
              Registrations
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href={exportHref(search, status)} style={{ ...buttonStyle, display: 'inline-block', textDecoration: 'none' }}>Export CSV</a>
            <form action={logoutAdmin}>
              <input type="hidden" name="locale" value={locale} />
              <button type="submit" style={{ ...buttonStyle, background: 'transparent', color: 'var(--color-ink)' }}>Sign out</button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-8">
          <div style={{ borderTop: '3px solid var(--color-ink)', paddingTop: 10 }}>
            <p style={labelStyle}>Total</p>
            <p style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-display)', fontSize: 38, fontWeight: 700 }}>{summary.total}</p>
          </div>
          {REGISTRATION_STATUSES.map((item) => (
            <div key={item} style={{ borderTop: '3px solid var(--color-border)', paddingTop: 10 }}>
              <p style={labelStyle}>{statusLabels[item]}</p>
              <p style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-display)', fontSize: 38, fontWeight: 700 }}>
                {summary.byStatus[item]}
              </p>
            </div>
          ))}
        </div>

        <form className="grid grid-cols-1 md:grid-cols-[1fr_220px_auto] gap-3 mb-8">
          <input name="q" defaultValue={search} placeholder="Search name, email, club, nationality" style={inputStyle} />
          <select name="status" defaultValue={status ?? ''} style={inputStyle}>
            <option value="">All statuses</option>
            {REGISTRATION_STATUSES.map((item) => (
              <option key={item} value={item}>{statusLabels[item]}</option>
            ))}
          </select>
          <button type="submit" style={buttonStyle}>Filter</button>
        </form>

        <div style={{ overflowX: 'auto', borderTop: '1px solid var(--color-border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1120 }}>
            <thead>
              <tr style={{ textAlign: 'left' }}>
                {['Participant', 'Event', 'Experience', 'Status', 'Check-in', 'Admin notes', 'Registered', 'Save'].map((heading) => (
                  <th key={heading} style={{ ...labelStyle, padding: '14px 10px', borderBottom: '1px solid var(--color-border)' }}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {registrations.map((registration) => (
                <tr key={registration.id} style={{ borderBottom: '1px solid var(--color-border)', verticalAlign: 'top' }}>
                  <td style={{ padding: 10, color: 'var(--color-ink)', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.5 }}>
                    <strong>{registration.name}</strong>
                    <br />
                    <a href={`mailto:${registration.email}`} style={{ color: 'var(--color-body-text)' }}>{registration.email}</a>
                    <br />
                    {[registration.club, registration.nationality].filter(Boolean).join(' / ') || '-'}
                  </td>
                  <td style={{ padding: 10, fontFamily: 'var(--font-body)', fontSize: 14 }}>{registration.eventType ?? '-'}</td>
                  <td style={{ padding: 10, fontFamily: 'var(--font-body)', fontSize: 14 }}>{registration.experienceLevel.toUpperCase()}</td>
                  <td style={{ padding: 10 }}>
                    <form id={`registration-${registration.id}`} action={updateRegistration}>
                      <input type="hidden" name="id" value={registration.id} />
                      <select name="status" defaultValue={registration.status} style={inputStyle}>
                        {REGISTRATION_STATUSES.map((item) => (
                          <option key={item} value={item}>{statusLabels[item]}</option>
                        ))}
                      </select>
                    </form>
                  </td>
                  <td style={{ padding: 10, fontFamily: 'var(--font-body)', fontSize: 14 }}>
                    <label className="inline-flex items-center gap-2">
                      <input form={`registration-${registration.id}`} name="checkedIn" type="checkbox" defaultChecked={registration.checkedIn} />
                      Checked in
                    </label>
                    <br />
                    <span style={{ color: 'var(--color-muted)', fontSize: 12 }}>{formatDate(registration.checkedInAt)}</span>
                  </td>
                  <td style={{ padding: 10 }}>
                    <textarea
                      form={`registration-${registration.id}`}
                      name="adminNotes"
                      defaultValue={registration.adminNotes ?? ''}
                      rows={3}
                      style={{ ...inputStyle, minWidth: 220, resize: 'vertical' }}
                    />
                  </td>
                  <td style={{ padding: 10, color: 'var(--color-body-text)', fontFamily: 'var(--font-body)', fontSize: 13 }}>
                    {formatDate(registration.createdAt)}
                  </td>
                  <td style={{ padding: 10 }}>
                    <button form={`registration-${registration.id}`} type="submit" style={{ ...buttonStyle, fontSize: 16, padding: '10px 12px' }}>
                      Save
                    </button>
                  </td>
                </tr>
              ))}
              {registrations.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: 24, color: 'var(--color-muted)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
                    No registrations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
