import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth-server';
import { deleteTestRegistrations, deleteTestWaitlist, deleteTestVolunteers } from '@/lib/db';

export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const registrations = await deleteTestRegistrations();
  const waitlist = await deleteTestWaitlist();
  const volunteers = await deleteTestVolunteers();
  return NextResponse.json({ deleted: { registrations, waitlist, volunteers } });
}
