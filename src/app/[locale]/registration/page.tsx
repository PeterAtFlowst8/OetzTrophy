import RegistrationForm from './RegistrationForm';
import { getSiteSettings } from '@/lib/settings';
import { getSiteImage } from '@/lib/siteContent';
import { isRegistrationOpen, isRegistrationTestMode } from '@/lib/registration';
import { getCategoryAvailability } from '@/lib/db';
import { resolveCaps } from '@/lib/capacity';

// Availability must be fresh during the opening rush; the server re-checks on submit regardless.
export const dynamic = 'force-dynamic';

export default async function RegistrationPage() {
  const [settings, headerImage] = await Promise.all([
    getSiteSettings(),
    getSiteImage('registration', '/images/event-boaterx.jpg', { width: 2000 }),
  ]);

  const availability = await getCategoryAvailability(resolveCaps(settings));

  const isTestMode = isRegistrationTestMode();
  const isOpen = isRegistrationOpen(settings.registrationOpensAt) || isTestMode;

  return (
    <RegistrationForm
      headerImage={headerImage}
      registrationOpensAt={settings.registrationOpensAt}
      registrationFeeEur={settings.registrationFeeEur}
      isOpen={isOpen}
      isTestMode={isTestMode}
      availability={availability}
    />
  );
}
