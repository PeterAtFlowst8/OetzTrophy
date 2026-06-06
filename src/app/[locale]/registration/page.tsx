import RegistrationForm from './RegistrationForm';
import { getSiteSettings } from '@/lib/settings';
import { getSiteImage } from '@/lib/siteContent';

export const revalidate = 60;

export default async function RegistrationPage() {
  const [settings, headerImage] = await Promise.all([
    getSiteSettings(),
    getSiteImage('registration', '/images/event-boaterx.jpg', { width: 2000 }),
  ]);

  return (
    <RegistrationForm
      headerImage={headerImage}
      registrationOpensAt={settings.registrationOpensAt}
      registrationFeeEur={settings.registrationFeeEur}
    />
  );
}
