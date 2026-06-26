import { NextRequest, NextResponse } from 'next/server';
import { runPendingSweep } from '@/lib/pending-sweep';

/**
 * Vercel Cron entry point for the pending-registration sweep. Authorized by the
 * `Authorization: Bearer ${CRON_SECRET}` header Vercel injects. Fails closed when
 * the secret is unset so the endpoint is never publicly runnable.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const summary = await runPendingSweep();
  return NextResponse.json({ ok: true, summary });
}
