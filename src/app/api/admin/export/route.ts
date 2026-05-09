import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { isRegistrationStatus, listRegistrations, RegistrationRecord, RegistrationStatus } from '@/lib/db';

function csvCell(value: string | number | boolean | null | undefined) {
  const text = value === null || value === undefined ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function registrationRow(registration: RegistrationRecord) {
  return [
    registration.id,
    registration.name,
    registration.email,
    registration.club,
    registration.nationality,
    registration.eventType,
    registration.experienceLevel,
    registration.status,
    registration.checkedIn,
    registration.adminNotes,
    registration.stripeSessionId,
    registration.stripePaymentId,
    registration.createdAt,
    registration.updatedAt,
  ].map(csvCell).join(',');
}

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const search = request.nextUrl.searchParams.get('q') ?? undefined;
  const rawStatus = request.nextUrl.searchParams.get('status') ?? '';
  const status = isRegistrationStatus(rawStatus) ? rawStatus as RegistrationStatus : undefined;
  const registrations = await listRegistrations({ search, status, limit: 1000 });
  const header = [
    'id',
    'name',
    'email',
    'club',
    'nationality',
    'event_type',
    'experience_level',
    'status',
    'checked_in',
    'admin_notes',
    'stripe_session_id',
    'stripe_payment_id',
    'created_at',
    'updated_at',
  ].map(csvCell).join(',');
  const csv = [header, ...registrations.map(registrationRow)].join('\n');
  const filename = `oetz-trophy-registrations-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      'Cache-Control': 'no-store',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Type': 'text/csv; charset=utf-8',
    },
  });
}
