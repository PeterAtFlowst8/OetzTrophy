'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { clearAdminSession, isAdminAuthenticated, setAdminSession, verifyAdminPassword } from '@/lib/admin-auth';
import { isRegistrationStatus, updateRegistrationAdminFields } from '@/lib/db';

function adminPath(locale: string) {
  return locale === 'en' ? '/en/admin' : '/admin';
}

export async function loginAdmin(formData: FormData) {
  const password = String(formData.get('password') || '');
  const locale = String(formData.get('locale') || 'de');

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
