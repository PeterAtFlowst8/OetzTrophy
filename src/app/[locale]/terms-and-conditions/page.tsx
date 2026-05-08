import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';

const content = {
  de: {
    label: 'Rechtliches',
    title: 'Teilnahmebedingungen',
    description: 'Teilnahmebedingungen und Haftungsfreistellung für OETZ TROPHY und Boater X / Oetz Kayak Cross.',
    intro: 'Die OETZ TROPHY und der Boater X / Oetz Kayak Cross sind extreme Kajak-Veranstaltungen. Du musst über ausreichende Erfahrung im schweren Wildwasser, eine passende körperliche Verfassung und vollständige Sicherheitsausrüstung verfügen.',
    sections: [
      {
        heading: 'Teilnahmevoraussetzungen',
        items: [
          'Du bist ein erfahrener Wildwasserpaddler und fühlst dich auf der Ötztaler Ache sicher.',
          'Du verfügst über vollständige Sicherheitsausrüstung: Helm, Schwimmweste, Spritzdecke und Wurfsack.',
          'Du nimmst am verpflichtenden Briefing teil und befolgst die Anweisungen der Rennleitung und Sicherheitsposten.',
        ],
      },
      {
        heading: 'Risiko und Eigenverantwortung',
        items: [
          'Die Teilnahme erfolgt auf eigenes Risiko.',
          'Wildwasser-Kajakfahren kann zu schweren Verletzungen oder Tod führen.',
          'Du bestätigst, dass du die Gefahren kennst und für deine Entscheidung zur Teilnahme selbst verantwortlich bist.',
        ],
      },
      {
        heading: 'Haftungsfreistellung',
        items: [
          'Du verzichtest, soweit gesetzlich zulässig, auf Ansprüche gegen Veranstalter, Helfer, Sponsoren und Grundeigentümer wegen Schäden, die aus der Teilnahme entstehen.',
          'Ausgenommen sind Schäden, die durch Vorsatz oder grobe Fahrlässigkeit verursacht wurden.',
        ],
      },
      {
        heading: 'Datenschutz und Medien',
        items: [
          'Du akzeptierst die Verarbeitung deiner Daten zur Durchführung und Dokumentation der Veranstaltung.',
          'Fotos und Videoaufnahmen können für Berichterstattung, Ergebnisse, Social Media und zukünftige Veranstaltungs-Kommunikation verwendet werden.',
        ],
      },
    ],
    privacy: 'Datenschutzerklärung',
    back: 'Zur Anmeldung',
  },
  en: {
    label: 'Legal',
    title: 'Conditions of Participation',
    description: 'Conditions of participation and waiver for OETZ TROPHY and Boater X / Oetz Kayak Cross.',
    intro: 'The OETZ TROPHY and Boater X / Oetz Kayak Cross are extreme kayaking events. You must have sufficient experience in difficult whitewater, suitable physical condition and complete safety equipment.',
    sections: [
      {
        heading: 'Participation requirements',
        items: [
          'You are an experienced whitewater kayaker and feel confident on the Ötztaler Ache.',
          'You have full safety equipment: helmet, PFD, spray skirt and throw bag.',
          'You attend the mandatory briefing and follow all instructions from race management and safety staff.',
        ],
      },
      {
        heading: 'Risk and personal responsibility',
        items: [
          'Participation is at your own risk.',
          'Whitewater kayaking can lead to serious injury or death.',
          'You confirm that you understand the risks and are responsible for your own decision to participate.',
        ],
      },
      {
        heading: 'Waiver and release',
        items: [
          'To the extent permitted by law, you waive claims against the organiser, helpers, sponsors and landowners for damages arising from participation.',
          'This does not apply to damage caused intentionally or through gross negligence.',
        ],
      },
      {
        heading: 'Privacy and media',
        items: [
          'You accept the processing of your data for running and documenting the event.',
          'Photos and video recordings may be used for reporting, results, social media and future event communication.',
        ],
      },
    ],
    privacy: 'Privacy policy',
    back: 'Back to registration',
  },
};

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const copy = content[locale === 'en' ? 'en' : 'de'];
  return { title: `${copy.title} | OETZ TROPHY`, description: copy.description };
}

export default async function TermsAndConditionsPage({ params }: Props) {
  const { locale } = await params;
  const copy = content[locale === 'en' ? 'en' : 'de'];

  return (
    <main>
      <section className="py-20 md:py-28" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="max-w-3xl mx-auto px-6 md:px-12">
          <p
            className="uppercase mb-4"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.16em',
              color: 'var(--color-accent)',
            }}
          >
            {copy.label}
          </p>

          <h1
            className="uppercase mb-8"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(42px, 7vw, 76px)',
              fontWeight: 700,
              color: 'var(--color-ink)',
              lineHeight: 0.92,
            }}
          >
            {copy.title}
          </h1>

          <p
            className="mb-10"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '17px',
              lineHeight: 1.8,
              color: 'var(--color-body-text)',
            }}
          >
            {copy.intro}
          </p>

          <div className="flex flex-col gap-10">
            {copy.sections.map((section) => (
              <section key={section.heading}>
                <h2
                  className="uppercase mb-4"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '28px',
                    fontWeight: 700,
                    color: 'var(--color-ink)',
                  }}
                >
                  {section.heading}
                </h2>
                <ul
                  className="list-disc pl-5 flex flex-col gap-2"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '15px',
                    lineHeight: 1.7,
                    color: 'var(--color-body-text)',
                  }}
                >
                  {section.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </section>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 mt-12">
            <Link href="/datenschutz" className="underline" style={{ color: 'var(--color-ink)' }}>
              {copy.privacy}
            </Link>
            <Link href="/registration" className="underline" style={{ color: 'var(--color-ink)' }}>
              {copy.back}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
