import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth-server';
import { listRegistrations } from '@/lib/db';
import { toCsv } from '@/lib/csv';

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const registrations = await listRegistrations();
  const csv = toCsv(registrations, [
    { key: 'id', header: 'ID' },
    { key: 'firstName', header: 'First name' },
    { key: 'lastName', header: 'Last name' },
    { key: 'email', header: 'Email' },
    { key: 'nationality', header: 'Nationality' },
    { key: 'tshirtSize', header: 'T-shirt' },
    { key: 'status', header: 'Status' },
    { key: 'stripeSessionId', header: 'Stripe session' },
    { key: 'stripePaymentId', header: 'Stripe payment' },
    { key: 'createdAt', header: 'Created' },
    { key: 'updatedAt', header: 'Updated' },
  ]);

  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="registrations-${stamp}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
