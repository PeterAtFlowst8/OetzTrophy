import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import FadeIn from '@/components/motion/FadeIn';

const meta = {
  de: { title: 'Anmeldung bestätigt — Boater X OETZ TROPHY 2026', description: 'Deine Anmeldung für den Boater X beim Ötztaler Kajakfestival 2026 wurde bestätigt. Zahlung eingegangen. Wir sehen uns am 18. September auf der Ötztaler Ache!' },
  en: { title: 'Registration Confirmed — Boater X OETZ TROPHY 2026', description: 'Your registration for Boater X at the Ötztal Kayak Festival 2026 has been confirmed. Payment received. See you on 18 September on the Ötztaler Ache in Tyrol!' },
};

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const m = meta[(locale === 'en' ? 'en' : 'de') as keyof typeof meta];
  return { title: m.title, description: m.description };
}

export default async function RegistrationSuccessPage() {
  const t = await getTranslations('registration');

  return (
    <main>
      <section
        className="min-h-screen flex items-center justify-center px-6"
        style={{ backgroundColor: 'var(--color-ink)' }}
      >
        <FadeIn>
          <div className="text-center max-w-lg">
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
              {t('successText')}
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
        </FadeIn>
      </section>
    </main>
  );
}
