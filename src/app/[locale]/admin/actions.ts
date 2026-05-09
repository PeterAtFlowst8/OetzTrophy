'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { clearAdminSession, isAdminAuthenticated, setAdminSession, verifyAdminPassword } from '@/lib/admin-auth';
import { isRegistrationStatus, updateRegistrationAdminFields } from '@/lib/db';
import { checkRateLimit, getClientIp, hashRateLimitValue } from '@/lib/rate-limit';

const ADMIN_LOGIN_LIMIT = { limit: 8, windowMs: 15 * 60 * 1000 };

function adminPath(locale: string) {
  return locale === 'en' ? '/en/admin' : '/admin';
}

export async function loginAdmin(formData: FormData) {
  const password = String(formData.get('password') || '');
  const locale = String(formData.get('locale') || 'de');
  const requestHeaders = await headers();
  const clientIp = getClientIp(requestHeaders);
  const loginLimit = checkRateLimit({
    key: `admin-login:${hashRateLimitValue(clientIp)}`,
    ...ADMIN_LOGIN_LIMIT,
  });

  if (loginLimit.limited) {
    redirect(`${adminPath(locale)}?error=limited`);
  }

  if (!verifyAdminPassword(password)) {
    redirect(`${adminPath(locale)}?error=invalid`);
  }

  await setAdminSession();
  redirect(adminPath(locale));
}

export async function logoutAdmin(formData: FormData) {
  const locale = String(formData.get('locale') || 'de');
  await clearAdminSession();
  redirect(adminPath(locale));
}

export async function updateRegistration(formData: FormData) {
  if (!(await isAdminAuthenticated())) {
    redirect('/admin?error=session');
  }

  const id = Number(formData.get('id'));
  const status = String(formData.get('status') || '');
  const checkedIn = formData.get('checkedIn') === 'on';
  const adminNotes = String(formData.get('adminNotes') || '').trim();

  if (!Number.isInteger(id) || id <= 0 || !isRegistrationStatus(status)) {
    return;
  }

  await updateRegistrationAdminFields({
    id,
    status,
    checkedIn,
    adminNotes: adminNotes || null,
  });

  revalidatePath('/admin');
  revalidatePath('/en/admin');
}
