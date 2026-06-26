import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth-server';
import { listVolunteers } from '@/lib/db';
import { toCsv } from '@/lib/csv';
import { roleLabel, dayLabel } from '@/lib/volunteerLabels';

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const volunteers = await listVolunteers();
  const rows = volunteers.map((v) => ({
    id: v.id,
    firstName: v.firstName,
    lastName: v.lastName,
    email: v.email,
    tshirtSize: v.tshirtSize ?? '',
    roles: v.roles.map(roleLabel).join('; '),
    availability: v.availability.map(dayLabel).join('; '),
    otherHelp: v.otherHelp ?? '',
    experience: v.experience ?? '',
    status: v.status,
    isTest: v.isTest ? 'yes' : 'no',
    createdAt: v.createdAt,
  }));

  const csv = toCsv(rows, [
    { key: 'id', header: 'ID' },
    { key: 'firstName', header: 'First name' },
    { key: 'lastName', header: 'Last name' },
    { key: 'email', header: 'Email' },
    { key: 'tshirtSize', header: 'T-shirt' },
    { key: 'roles', header: 'Roles' },
    { key: 'availability', header: 'Availability' },
    { key: 'otherHelp', header: 'Other help' },
    { key: 'experience', header: 'Experience' },
    { key: 'status', header: 'Status' },
    { key: 'isTest', header: 'Test' },
    { key: 'createdAt', header: 'Created' },
  ]);

  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="volunteers-${stamp}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
