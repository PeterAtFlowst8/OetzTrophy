import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth-server';
import { runPendingSweep } from '@/lib/pending-sweep';

/**
 * Admin-triggered sweep — lets the organizer clear the backlog on demand and test
 * without waiting for cron. Defaults to a DRY RUN; the caller must explicitly send
 * `{ dryRun: false }` to perform any DB write or send any email.
 */
export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = (await request.json().catch(() => ({}))) as { dryRun?: boolean } | null;
  const dryRun = body?.dryRun !== false;
  const summary = await runPendingSweep({ dryRun });
  return NextResponse.json({ ok: true, summary });
}
