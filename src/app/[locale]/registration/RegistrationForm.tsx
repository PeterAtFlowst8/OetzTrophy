'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import PageHeader from '@/components/PageHeader';
import { registrationOpensLabel } from '@/lib/registration';
import TextWithLinks from '@/components/TextWithLinks';
import TestModeBanner from '@/components/TestModeBanner';
import TurnstileWidget from '@/components/TurnstileWidget';

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';

const tshirtSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

type Props = {
  headerImage: string;
  registrationOpensAt: string | null;
  registrationFeeEur: number | null;
  isOpen: boolean;
  isTestMode: boolean;
};

export default function RegistrationForm({
  headerImage,
  registrationOpensAt,
  registrationFeeEur,
  isOpen,
  isTestMode,
}: Props) {
  const t = useTranslations('registration');
  const locale = useLocale();
  const opensLabel = registrationOpensLabel(locale, registrationOpensAt);
  const feeDisplay = `€${registrationFeeEur ?? 135}`;
  const [previewMode, setPreviewMode] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    nationality: '',
    tshirtSize: '',
    acceptedTerms: false,
    acceptedAwpRules: false,
    confirmedOver18: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileResetSignal, setTurnstileResetSignal] = useState(0);
  const handleTurnstileToken = useCallback((token: string | null) => {
    setTurnstileToken(token);
  }, []);

  useEffect(() => {
    setPreviewMode(new URLSearchParams(window.location.search).get('preview') === 'form');
  }, []);

  const showForm = isOpen || previewMode;
  const canSubmit = Boolean(
    isOpen &&
    form.firstName &&
    form.lastName &&
    form.email &&
    form.nationality &&
    form.tshirtSize &&
    form.acceptedTerms &&
    form.acceptedAwpRules &&
    form.confirmedOver18 &&
    (!TURNSTILE_SITE_KEY || Boolean(turnstileToken)) &&
    !submitting,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOpen) {
      setError(t('previewNotice', { opens: opensLabel }));
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, turnstileToken: turnstileToken ?? '' }),
      });

      const data = await res.json();

      if (!res.ok) {
        const codeMessages: Record<string, string> = {
          turnstile_failed: t('turnstileFailed'),
          already_registered: t('alreadyRegistered'),
          rate_limited: t('tooManyAttempts'),
        };
        setError((data.code && codeMessages[data.code]) || data.error || 'Something went wrong');
        setTurnstileToken(null);
        setTurnstileResetSignal((n) => n + 1);
        setSubmitting(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError('Network error. Please try again.');
      setTurnstileToken(null);
      setTurnstileResetSignal((n) => n + 1);
      setSubmitting(false);
    }
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontSize: '12px',
    textTransform: 'uppercase' as const,
    color: 'var(--color-ink)',
    marginBottom: '8px',
    display: 'block',
    fontWeight: 700,
  };

  const fieldClass =
    'w-full border border-[var(--color-border)] bg-white px-4 py-3.5 outline-none placeholder:text-[var(--color-muted)] transition-colors duration-200 focus:border-[var(--color-accent)] focus:ring-2 focus:ring-amber-500/20';

  return (
    <main>
      <PageHeader
        label={t('label')}
        title={t('title')}
        image={headerImage}
      />

      <section className="py-16 md:py-24" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="max-w-6xl mx-auto px-6 md:px-12">

          {!showForm ? (
            <div>
              <div className="max-w-2xl mx-auto text-center py-12">
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
                  className="mx-auto"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '16px',
                    lineHeight: 1.7,
                    color: 'var(--color-body-text)',
                    maxWidth: '56ch',
                  }}
                >
                  {t('closedText', { opens: opensLabel })}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
              <div>
                <div className="lg:sticky lg:top-28">
                  <p
                    className="mb-7"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '17px',
                      lineHeight: 1.8,
                      color: 'var(--color-body-text)',
                      maxWidth: '62ch',
                    }}
                  >
                    <TextWithLinks text={t('intro')} />
                  </p>

                  <dl
                    className="grid grid-cols-2 gap-x-6 gap-y-5 border-t pt-6"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <div>
                      <dt
                        className="uppercase"
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '11px',
                          color: 'var(--color-muted)',
                        }}
                      >
                        {t('raceLabel')}
                      </dt>
                      <dd
                        className="mt-1 uppercase"
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '26px',
                          fontWeight: 700,
                          lineHeight: 1,
                          color: 'var(--color-ink)',
                        }}
                      >
                        OETZ TROPHY
                      </dd>
                    </div>
                    <div>
                      <dt
                        className="uppercase"
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '11px',
                          color: 'var(--color-muted)',
                        }}
                      >
                        {t('feeLabel')}
                      </dt>
                      <dd
                        className="mt-1 uppercase"
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '26px',
                          fontWeight: 700,
                          lineHeight: 1,
                          color: 'var(--color-ink)',
                        }}
                      >
                        {feeDisplay}
                      </dd>
                    </div>
                  </dl>

                  {previewMode && !isOpen && (
                    <p
                      className="mt-7 p-4"
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '14px',
                        lineHeight: 1.6,
                        color: 'var(--color-ink)',
                        backgroundColor: 'rgba(245, 158, 11, 0.14)',
                        border: '1px solid rgba(245, 158, 11, 0.45)',
                      }}
                    >
                      {t('previewNotice', { opens: opensLabel })}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <form
                  onSubmit={handleSubmit}
                  className="bg-white p-5 sm:p-7 md:p-9"
                  style={{ border: '1px solid var(--color-border)' }}
                >
                  {isTestMode && (
                    <TestModeBanner title={t('testBannerTitle')} body={t('testBannerBody')} />
                  )}
                  <div className="mb-8">
                    <h2
                      className="uppercase mb-2"
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(30px, 5vw, 46px)',
                        fontWeight: 700,
                        lineHeight: 0.95,
                        color: 'var(--color-ink)',
                      }}
                    >
                      {t('formTitle')}
                    </h2>
                    <p
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '14px',
                        lineHeight: 1.7,
                        color: 'var(--color-body-text)',
                      }}
                    >
                      <TextWithLinks text={t('formIntro')} />
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="firstName" style={labelStyle}>
                        {t('firstNameLabel')} *
                      </label>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        autoComplete="given-name"
                        required
                        value={form.firstName}
                        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                        placeholder={t('firstNamePlaceholder')}
                        className={fieldClass}
                        style={{
                          fontFamily: 'var(--font-body)',
                          color: 'var(--color-ink)',
                        }}
                      />
                    </div>

                    <div>
                      <label htmlFor="lastName" style={labelStyle}>
                        {t('lastNameLabel')} *
                      </label>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        autoComplete="family-name"
                        required
                        value={form.lastName}
                        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                        placeholder={t('lastNamePlaceholder')}
                        className={fieldClass}
                        style={{
                          fontFamily: 'var(--font-body)',
                          color: 'var(--color-ink)',
                        }}
                      />
                    </div>

                    <div>
                      <label htmlFor="email" style={labelStyle}>
                        {t('emailLabel')} *
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder={t('emailPlaceholder')}
                        className={fieldClass}
                        style={{
                          fontFamily: 'var(--font-body)',
                          color: 'var(--color-ink)',
                        }}
                      />
                    </div>

                    <div>
                      <label htmlFor="nationality" style={labelStyle}>
                        {t('nationalityLabel')} *
                      </label>
                      <input
                        id="nationality"
                        name="nationality"
                        type="text"
                        autoComplete="country-name"
                        required
                        value={form.nationality}
                        onChange={(e) => setForm({ ...form, nationality: e.target.value })}
                        placeholder={t('nationalityPlaceholder')}
                        className={fieldClass}
                        style={{
                          fontFamily: 'var(--font-body)',
                          color: 'var(--color-ink)',
                        }}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="tshirtSize" style={labelStyle}>
                        {t('tshirtLabel')} *
                      </label>
                      <select
                        id="tshirtSize"
                        name="tshirtSize"
                        required
                        value={form.tshirtSize}
                        onChange={(e) => setForm({ ...form, tshirtSize: e.target.value })}
                        className={fieldClass}
                        style={{
                          fontFamily: 'var(--font-body)',
                          color: form.tshirtSize ? 'var(--color-ink)' : 'var(--color-muted)',
                        }}
                      >
                        <option value="">{t('tshirtPlaceholder')}</option>
                        {tshirtSizes.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <fieldset
                    className="mt-8 flex flex-col gap-4 border-t pt-6"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <legend
                      className="sr-only"
                    >
                      {t('requiredNote')}
                    </legend>

                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        name="acceptedTerms"
                        required
                        checked={form.acceptedTerms}
                        onChange={(e) => setForm({ ...form, acceptedTerms: e.target.checked })}
                        className="mt-1 size-5 shrink-0"
                        style={{ accentColor: 'var(--color-accent)' }}
                      />
                      <span
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '14px',
                          lineHeight: 1.6,
                          color: 'var(--color-body-text)',
                        }}
                      >
                        {t('termsPrefix')}{' '}
                        <Link
                          href="/terms-and-conditions"
                          className="text-[var(--color-ink)] underline underline-offset-4 hover:text-[var(--color-accent-dark)]"
                        >
                          {t('termsLink')}
                        </Link>
                        {t('termsSuffix')}
                      </span>
                    </label>

                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        name="acceptedAwpRules"
                        required
                        checked={form.acceptedAwpRules}
                        onChange={(e) => setForm({ ...form, acceptedAwpRules: e.target.checked })}
                        className="mt-1 size-5 shrink-0"
                        style={{ accentColor: 'var(--color-accent)' }}
                      />
                      <span
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '14px',
                          lineHeight: 1.6,
                          color: 'var(--color-body-text)',
                        }}
                      >
                        {t('awpPrefix')}{' '}
                        <a
                          href="https://awpkayak.org/kayak-rules"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--color-ink)] underline underline-offset-4 hover:text-[var(--color-accent-dark)]"
                        >
                          {t('awpLink')}
                        </a>
                        {t('awpSuffix')}
                      </span>
                    </label>

                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        name="confirmedOver18"
                        required
                        checked={form.confirmedOver18}
                        onChange={(e) => setForm({ ...form, confirmedOver18: e.target.checked })}
                        className="mt-1 size-5 shrink-0"
                        style={{ accentColor: 'var(--color-accent)' }}
                      />
                      <span
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '14px',
                          lineHeight: 1.6,
                          color: 'var(--color-body-text)',
                        }}
                      >
                        {t('ageConfirmation')}
                      </span>
                    </label>
                  </fieldset>

                  {error && (
                    <p
                      className="mt-5"
                      style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: '#b91c1c' }}
                    >
                      {error}
                    </p>
                  )}

                  {TURNSTILE_SITE_KEY && (
                    <div className="mt-6">
                      <TurnstileWidget
                        siteKey={TURNSTILE_SITE_KEY}
                        locale={locale}
                        onToken={handleTurnstileToken}
                        resetSignal={turnstileResetSignal}
                        onScriptError={() => setError(t('turnstileFailed'))}
                      />
                      <p
                        className="mt-2"
                        style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--color-muted)' }}
                      >
                        {t('turnstileNotice')}
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="mt-7 w-full py-4 uppercase transition-colors duration-200 disabled:opacity-45"
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '22px',
                      fontWeight: 700,
                      backgroundColor: 'var(--color-ink)',
                      color: 'white',
                      border: 'none',
                      cursor: submitting ? 'wait' : canSubmit ? 'pointer' : 'not-allowed',
                    }}
                  >
                    {submitting ? t('submitting') : t('submit')}
                  </button>

                  <p
                    className="text-center mt-3"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '12px',
                      color: 'var(--color-muted)',
                    }}
                  >
                    {t('paymentNote')}
                  </p>
                </form>
              </div>
            </div>
          )}

        </div>
      </section>
    </main>
  );
}
