'use client';

import { useCallback, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import PageHeader from '@/components/PageHeader';
import TurnstileWidget from '@/components/TurnstileWidget';

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';

type Props = { headerImage: string };

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '12px',
  textTransform: 'uppercase',
  color: 'var(--color-ink)',
  marginBottom: '8px',
  display: 'block',
  fontWeight: 700,
  letterSpacing: '0.04em',
};

const fieldClass =
  'w-full border border-[var(--color-border)] bg-white px-4 py-3.5 outline-none placeholder:text-[var(--color-muted)] transition-colors duration-200 focus:border-[var(--color-accent)] focus:ring-2 focus:ring-amber-500/20';

const hintStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '12px',
  color: 'var(--color-muted)',
};

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3.5 mt-9 mb-4">
      <span
        className="uppercase"
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '0.18em',
          color: 'var(--color-accent-text)',
        }}
      >
        {children}
      </span>
      <span className="flex-1" style={{ height: '1px', backgroundColor: 'var(--color-border)' }} />
    </div>
  );
}

export default function VolunteerForm({ headerImage }: Props) {
  const t = useTranslations('volunteerSignup');
  const locale = useLocale();

  const roles = [
    { key: 'media', label: t('roleMedia'), desc: t('roleMediaDesc') },
    { key: 'registration', label: t('roleRegistration'), desc: t('roleRegistrationDesc') },
    { key: 'safety', label: t('roleSafety'), desc: t('roleSafetyDesc') },
    { key: 'first_aid', label: t('roleFirstAid'), desc: t('roleFirstAidDesc') },
  ];
  const days = [
    { key: 'thu', label: t('dayThu'), sub: t('dayThuSub') },
    { key: 'fri', label: t('dayFri'), sub: t('dayFriSub') },
    { key: 'sat', label: t('daySat'), sub: t('daySatSub') },
    { key: 'sun', label: t('daySun'), sub: t('daySunSub') },
  ];

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    roles: [] as string[],
    availability: [] as string[],
    otherHelp: '',
    experience: '',
    acceptedConsent: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileResetSignal, setTurnstileResetSignal] = useState(0);
  const handleTurnstileToken = useCallback((token: string | null) => setTurnstileToken(token), []);

  const toggle = (list: string[], key: string) =>
    list.includes(key) ? list.filter((k) => k !== key) : [...list, key];

  const canSubmit = Boolean(
    form.firstName &&
      form.lastName &&
      form.email &&
      form.acceptedConsent &&
      (!TURNSTILE_SITE_KEY || turnstileToken) &&
      !submitting,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/volunteer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, turnstileToken: turnstileToken ?? '' }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const codeMessages: Record<string, string> = {
          turnstile_failed: t('turnstileFailed'),
          rate_limited: t('tooManyAttempts'),
        };
        setError((data.code && codeMessages[data.code]) || data.error || t('error'));
        setTurnstileToken(null);
        setTurnstileResetSignal((n) => n + 1);
        setSubmitting(false);
        return;
      }
      setSuccess(true);
      setSubmitting(false);
    } catch {
      setError(t('error'));
      setTurnstileToken(null);
      setTurnstileResetSignal((n) => n + 1);
      setSubmitting(false);
    }
  };

  return (
    <main>
      <PageHeader label={t('label')} title={t('title')} image={headerImage} />

      <section className="py-16 md:py-24" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="max-w-3xl mx-auto px-6 md:px-12">
          {success ? (
            <div
              className="bg-white p-6 sm:p-8 md:p-10 py-12 text-center"
              style={{ border: '1px solid var(--color-border)' }}
            >
              <p
                className="uppercase mb-3"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(28px,4vw,42px)',
                  fontWeight: 700,
                  color: 'var(--color-ink)',
                  lineHeight: 0.95,
                }}
              >
                {t('successTitle')}
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '15px',
                  lineHeight: 1.7,
                  color: 'var(--color-body-text)',
                  maxWidth: '54ch',
                  margin: '0 auto',
                }}
              >
                {t('successText')}
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-white p-6 sm:p-8 md:p-10"
              style={{ border: '1px solid var(--color-border)' }}
            >
              <h2
                className="uppercase mb-3"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(30px,5vw,46px)',
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
                  maxWidth: '60ch',
                }}
              >
                {t('intro')}
              </p>
              <p className="mt-3" style={hintStyle}>
                {t('requiredNote')}
              </p>

              {/* About you */}
              <SectionHeader>{t('h_about')}</SectionHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="firstName" style={labelStyle}>
                    {t('firstName')} *
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className={fieldClass}
                    style={{ fontFamily: 'var(--font-body)', color: 'var(--color-ink)' }}
                  />
                </div>
                <div>
                  <label htmlFor="lastName" style={labelStyle}>
                    {t('lastName')} *
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    required
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className={fieldClass}
                    style={{ fontFamily: 'var(--font-body)', color: 'var(--color-ink)' }}
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="email" style={labelStyle}>
                    {t('email')} *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={fieldClass}
                    style={{ fontFamily: 'var(--font-body)', color: 'var(--color-ink)' }}
                  />
                </div>
              </div>

              {/* Where you can help */}
              <SectionHeader>{t('h_help')}</SectionHeader>
              <p className="mb-4" style={hintStyle}>
                {t('help_sub')}
              </p>
              <div className="flex flex-col gap-2.5">
                {roles.map((r) => {
                  const checked = form.roles.includes(r.key);
                  return (
                    <label
                      key={r.key}
                      className="flex items-start gap-3.5 border px-4 py-3.5 cursor-pointer transition-colors"
                      style={{
                        borderColor: checked ? 'var(--color-accent)' : 'var(--color-border)',
                        backgroundColor: checked ? 'rgba(245,158,11,0.08)' : 'white',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => setForm({ ...form, roles: toggle(form.roles, r.key) })}
                        className="mt-0.5 size-5 shrink-0"
                        style={{ accentColor: 'var(--color-accent)' }}
                      />
                      <span className="flex flex-col gap-0.5">
                        <span
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '15px',
                            fontWeight: 600,
                            color: 'var(--color-ink)',
                          }}
                        >
                          {r.label}
                        </span>
                        <span
                          style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-muted)' }}
                        >
                          {r.desc}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
              <div className="mt-5">
                <label htmlFor="otherHelp" style={labelStyle}>
                  {t('other_label')}
                </label>
                <textarea
                  id="otherHelp"
                  name="otherHelp"
                  rows={3}
                  value={form.otherHelp}
                  onChange={(e) => setForm({ ...form, otherHelp: e.target.value })}
                  placeholder={t('other_ph')}
                  className={fieldClass}
                  style={{ fontFamily: 'var(--font-body)', color: 'var(--color-ink)', resize: 'vertical' }}
                />
              </div>

              {/* When you're available */}
              <SectionHeader>{t('h_when')}</SectionHeader>
              <p className="mb-4" style={hintStyle}>
                {t('when_sub')}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {days.map((d) => {
                  const checked = form.availability.includes(d.key);
                  return (
                    <label
                      key={d.key}
                      className="border px-3 py-3.5 cursor-pointer transition-colors flex flex-col gap-2"
                      style={{
                        borderColor: checked ? 'var(--color-accent)' : 'var(--color-border)',
                        backgroundColor: checked ? 'rgba(245,158,11,0.08)' : 'white',
                      }}
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setForm({ ...form, availability: toggle(form.availability, d.key) })
                          }
                          className="size-[18px] shrink-0"
                          style={{ accentColor: 'var(--color-accent)' }}
                        />
                        <span
                          className="uppercase"
                          style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '20px',
                            fontWeight: 700,
                            lineHeight: 1,
                            color: 'var(--color-ink)',
                          }}
                        >
                          {d.label}
                        </span>
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '12px',
                          lineHeight: 1.4,
                          color: 'var(--color-muted)',
                        }}
                      >
                        {d.sub}
                      </span>
                    </label>
                  );
                })}
              </div>

              {/* Your experience */}
              <SectionHeader>{t('h_exp')}</SectionHeader>
              <div>
                <label htmlFor="experience" style={labelStyle}>
                  {t('exp_label')}
                </label>
                <textarea
                  id="experience"
                  name="experience"
                  rows={4}
                  value={form.experience}
                  onChange={(e) => setForm({ ...form, experience: e.target.value })}
                  placeholder={t('exp_ph')}
                  className={fieldClass}
                  style={{ fontFamily: 'var(--font-body)', color: 'var(--color-ink)', resize: 'vertical' }}
                />
              </div>

              {/* Confirmations */}
              <div className="mt-8 flex flex-col gap-4 border-t pt-6" style={{ borderColor: 'var(--color-border)' }}>
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="acceptedConsent"
                    required
                    checked={form.acceptedConsent}
                    onChange={(e) => setForm({ ...form, acceptedConsent: e.target.checked })}
                    className="mt-1 size-5 shrink-0"
                    style={{ accentColor: 'var(--color-accent)' }}
                  />
                  <span
                    style={{ fontFamily: 'var(--font-body)', fontSize: '14px', lineHeight: 1.6, color: 'var(--color-body-text)' }}
                  >
                    {t('consent')}
                  </span>
                </label>
              </div>

              {error && (
                <p className="mt-5" style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: '#b91c1c' }}>
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
                  <p className="mt-2" style={hintStyle}>
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
                className="text-center mt-3.5"
                style={{ fontFamily: 'var(--font-body)', fontSize: '12px', lineHeight: 1.6, color: 'var(--color-muted)' }}
              >
                {t('note')}
              </p>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
