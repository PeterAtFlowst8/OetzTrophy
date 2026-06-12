/**
 * Server-component/route helper: is the current request's cookie valid?
 * Kept separate from admin-auth.ts so that vitest can import the core module
 * without resolving next/headers (which is a Next.js runtime-only import).
 */
import { cookies } from 'next/headers';
import { ADMIN_COOKIE, verifyAdminToken } from '@/lib/admin-auth';

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifyAdminToken(store.get(ADMIN_COOKIE)?.value);
}
