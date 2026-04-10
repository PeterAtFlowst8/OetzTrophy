'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import PageHeader from '@/components/PageHeader';
import FadeIn from '@/components/motion/FadeIn';

const experienceLevels = [
  { value: 'ww3', label: 'WW III' },
  { value: 'ww4', label: 'WW IV' },
  { value: 'ww5', label: 'WW V+' },
];

export default function RegistrationPage() {
  const t = useTranslations('registration');
  const [form, setForm] = useState({
    name: '',
    email: '',
    club: '',
    nationality: '',
    experienceLevel: '',
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

              {error && (
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: '#dc2626' }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting || !form.experienceLevel}
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

        </div>
      </section>
    </main>
  );
}
