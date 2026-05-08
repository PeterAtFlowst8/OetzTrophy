'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import PageHeader from '@/components/PageHeader';
import FadeIn from '@/components/motion/FadeIn';
import { isPreproductionRegistrationTestMode, isRegistrationOpen } from '@/lib/registration';

const experienceLevels = [
  { value: 'ww4', label: 'WW IV' },
  { value: 'ww5', label: 'WW V+' },
];

const eventTypes = [
  { value: 'oetz-trophy', labelKey: 'eventOetzTrophy', descriptionKey: 'eventOetzTrophyDescription' },
  { value: 'boater-x', labelKey: 'eventBoaterX', descriptionKey: 'eventBoaterXDescription' },
];

export default function RegistrationPage() {
  const t = useTranslations('registration');
  const isOpen = isRegistrationOpen();
  const testMode = isPreproductionRegistrationTestMode();
  const [form, setForm] = useState({
    name: '',
    email: '',
    club: '',
    nationality: '',
    experienceLevel: '',
    eventType: '',
    waiverAccepted: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        setSubmitting(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError('Network error. Please try again.');
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontSize: '15px',
    padding: '12px 16px',
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-ink)',
    width: '100%',
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontSize: '11px',
    letterSpacing: '0.15em',
    textTransform: 'uppercase' as const,
    color: 'var(--color-muted)',
    marginBottom: '6px',
    display: 'block',
  };

  return (
    <main>
      <PageHeader
        label={t('label')}
        title={t('title')}
        image="/images/event-boaterx.jpg"
      />

      <section className="py-16 md:py-24" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="max-w-2xl mx-auto px-6 md:px-12">

          {!isOpen ? (
            <FadeIn>
              <div className="text-center py-12">
                <p
                  className="uppercase mb-4"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(28px, 4vw, 44px)',
                    fontWeight: 700,
                    color: 'var(--color-ink)',
                    lineHeight: 0.95,
                  }}
                >
                  {t('closedTitle')}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '16px',
                    lineHeight: 1.7,
                    color: 'var(--color-body-text)',
                  }}
                >
                  {t('closedText')}
                </p>
              </div>
            </FadeIn>
          ) : (
          <>
          {testMode && (
            <FadeIn>
              <div
                className="mb-8 px-5 py-4"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  lineHeight: 1.6,
                  backgroundColor: '#FEF3C7',
                  border: '1px solid #F59E0B',
                  color: '#78350F',
                }}
              >
                Pre-production test mode: registrations are saved for testing and no Stripe payment is taken.
              </div>
            </FadeIn>
          )}
          <FadeIn>
            <p
              className="mb-10"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '17px',
                lineHeight: 1.8,
                color: 'var(--color-body-text)',
              }}
            >
              {t('intro')}
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              <div>
                <label style={labelStyle}>{t('eventTypeLabel')} *</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {eventTypes.map((event) => (
                    <button
                      key={event.value}
                      type="button"
                      onClick={() => setForm({ ...form, eventType: event.value })}
                      className="text-left p-4 transition-all duration-200"
                      style={{
                        border: '1px solid',
                        borderColor: form.eventType === event.value ? 'var(--color-accent)' : 'var(--color-border)',
                        backgroundColor: form.eventType === event.value ? '#FEF3C7' : 'var(--color-surface)',
                        color: 'var(--color-ink)',
                      }}
                    >
                      <span
                        className="block uppercase mb-2"
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '20px',
                          fontWeight: 700,
                        }}
                      >
                        {t(event.labelKey)}
                      </span>
                      <span
                        className="block"
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '13px',
                          lineHeight: 1.5,
                          color: 'var(--color-body-text)',
                        }}
                      >
                        {t(event.descriptionKey)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={labelStyle}>{t('nameLabel')} *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={t('namePlaceholder')}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>{t('emailLabel')} *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder={t('emailPlaceholder')}
                  style={inputStyle}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label style={labelStyle}>{t('clubLabel')}</label>
                  <input
                    type="text"
                    value={form.club}
                    onChange={(e) => setForm({ ...form, club: e.target.value })}
                    placeholder={t('clubPlaceholder')}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>{t('nationalityLabel')}</label>
                  <input
                    type="text"
                    value={form.nationality}
                    onChange={(e) => setForm({ ...form, nationality: e.target.value })}
                    placeholder={t('nationalityPlaceholder')}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>{t('experienceLabel')} *</label>
                <div className="flex gap-3">
                  {experienceLevels.map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setForm({ ...form, experienceLevel: level.value })}
                      className="flex-1 py-3 px-4 text-center uppercase transition-all duration-200"
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '18px',
                        fontWeight: 700,
                        border: '1px solid',
                        borderColor: form.experienceLevel === level.value ? 'var(--color-accent)' : 'var(--color-border)',
                        backgroundColor: form.experienceLevel === level.value ? 'var(--color-accent)' : 'var(--color-surface)',
                        color: form.experienceLevel === level.value ? '#111' : 'var(--color-ink)',
                      }}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  className="flex gap-3 items-start"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '14px',
                    lineHeight: 1.6,
                    color: 'var(--color-body-text)',
                  }}
                >
                  <input
                    type="checkbox"
                    required
                    checked={form.waiverAccepted}
                    onChange={(e) => setForm({ ...form, waiverAccepted: e.target.checked })}
                    style={{ marginTop: '4px' }}
                  />
                  <span>
                    {t('waiverText')}{' '}
                    <Link href="/terms-and-conditions" className="underline">
                      {t('conditionsLink')}
                    </Link>{' '}
                    {t('and')}{' '}
                    <Link href="/datenschutz" className="underline">
                      {t('privacyLink')}
                    </Link>
                    .
                  </span>
                </label>
              </div>

              {error && (
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: '#dc2626' }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting || !form.experienceLevel || !form.eventType || !form.waiverAccepted}
                className="mt-4 py-4 uppercase tracking-widest transition-all duration-200 hover:opacity-90 disabled:opacity-40"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '20px',
                  fontWeight: 700,
                  backgroundColor: 'var(--color-ink)',
                  color: 'white',
                  border: 'none',
                  cursor: submitting ? 'wait' : 'pointer',
                }}
              >
                {submitting ? t('submitting') : t('submit')}
              </button>

              <p
                className="text-center mt-2"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  color: 'var(--color-muted)',
                }}
              >
                {t('feeNote')}
              </p>

            </form>
          </FadeIn>
          </>
          )}

        </div>
      </section>
    </main>
  );
}
