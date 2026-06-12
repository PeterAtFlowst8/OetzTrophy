import RegistrationForm from './RegistrationForm';
import { getSiteSettings } from '@/lib/settings';
import { getSiteImage } from '@/lib/siteContent';
import { isRegistrationOpen, isRegistrationTestMode } from '@/lib/registration';

export const revalidate = 60;

export default async function RegistrationPage() {
  const [settings, headerImage] = await Promise.all([
    getSiteSettings(),
    getSiteImage('registration', '/images/event-boaterx.jpg', { width: 2000 }),
  ]);

  // Flip-once values are decided on the server and passed down as props
  // (hydration invariant — see Hero / commit 19581bf).
  const isTestMode = isRegistrationTestMode();
  const isOpen = isRegistrationOpen(settings.registrationOpensAt) || isTestMode;

  return (
    <RegistrationForm
      headerImage={headerImage}
      registrationOpensAt={settings.registrationOpensAt}
      registrationFeeEur={settings.registrationFeeEur}
      isOpen={isOpen}
      isTestMode={isTestMode}
    />
  );
}
