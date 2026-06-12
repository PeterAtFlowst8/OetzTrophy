import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import TestModeBanner from '@/components/TestModeBanner';
import { isRegistrationTestMode } from '@/lib/registration';

const meta = {
  de: { title: 'Anmeldung bestätigt - OETZ TROPHY Rennwochenende 2026', description: 'Deine Anmeldung für das OETZ TROPHY Rennwochenende 2026 wurde bestätigt. Zahlung eingegangen. Wir sehen uns auf der Ötztaler Ache!' },
  en: { title: 'Registration Confirmed - OETZ TROPHY Race Weekend 2026', description: 'Your registration for the OETZ TROPHY race weekend 2026 has been confirmed. Payment received. See you on the Ötztaler Ache in Tyrol!' },
};

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const m = meta[(locale === 'en' ? 'en' : 'de') as keyof typeof meta];
  return { title: m.title, description: m.description };
}

export default async function RegistrationSuccessPage() {
  const t = await getTranslations('registration');
  const isTestMode = isRegistrationTestMode();

  return (
    <main>
      <section
        className="min-h-screen flex items-center justify-center px-6"
        style={{ backgroundColor: 'var(--color-ink)' }}
      >
        <div>
          <div className="text-center max-w-lg">
            {isTestMode && (
              <TestModeBanner title={t('testBannerTitle')} body={t('testBannerBody')} />
            )}
            <div
              className="mx-auto mb-8"
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
              }}
            >
              ✓
            </div>

            <h1
              className="uppercase mb-4"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(36px, 6vw, 56px)',
                fontWeight: 700,
                color: 'white',
                lineHeight: 0.95,
              }}
            >
              {t('successTitle')}
            </h1>

            <p
              className="mb-8"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '16px',
                lineHeight: 1.7,
                color: 'rgba(255,255,255,0.6)',
              }}
            >
              {t('successRaceText')}
            </p>

            <Link
              href="/"
              className="inline-block uppercase py-3 px-8 transition-opacity duration-200 hover:opacity-80"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.15em',
                color: '#111',
                backgroundColor: 'var(--color-accent)',
              }}
            >
              {t('backHome')}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
