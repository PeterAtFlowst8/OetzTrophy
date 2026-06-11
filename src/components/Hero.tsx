'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { getCountdownState, type CountdownState } from '@/lib/countdown';
import { isRegistrationOpen, registrationOpensLabel } from '@/lib/registration';

type Props = {
  festivalDate?: string | null;
  registrationOpensAt?: string | null;
  imageSrc?: string;
  imageAlt?: string;
  mediaType?: 'image' | 'video';
  videoSrc?: string | null;
  videoAutoplay?: boolean;
};

/**
 * Background video for the hero. Autoplay starts from an effect (not the
 * autoPlay attribute) so visitors who prefer reduced motion keep the still
 * poster; with autoplay off the native controls let them start it manually.
 */
function HeroBackgroundVideo({
  src,
  poster,
  autoplay,
}: {
  src: string;
  poster?: string;
  autoplay: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!autoplay) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    ref.current?.play().catch(() => {
      /* autoplay blocked — poster stays visible */
    });
  }, [autoplay]);

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="metadata"
      poster={poster}
      controls={!autoplay}
      className="absolute inset-0 h-full w-full object-cover object-center"
    >
      <source src={src} />
    </video>
  );
}

export default function Hero({
  festivalDate,
  registrationOpensAt,
  imageSrc = '/images/hero.jpg',
  imageAlt,
  mediaType = 'image',
  videoSrc = null,
  videoAutoplay = true,
}: Props) {
  const t = useTranslations('hero');
  const tc = useTranslations('countdown');
  const locale = useLocale();

  const targetDate = festivalDate ? new Date(festivalDate) : new Date('2026-09-17T09:00:00Z');
  const targetTimestamp = targetDate.getTime();
  // The countdown is clock-derived and the homepage HTML is ISR-cached, so
  // reading the clock during render guarantees a hydration mismatch. State
  // starts empty; the first effect tick fills in the real values after mount.
  const [state, setState] = useState<CountdownState | null>(null);
  const registrationOpen = isRegistrationOpen(registrationOpensAt);
  const opensLabel = registrationOpensLabel(locale, registrationOpensAt);

  useEffect(() => {
    const updateCountdown = () => setState(getCountdownState(new Date(), new Date(targetTimestamp)));
    updateCountdown();
    const id = setInterval(updateCountdown, 1000);
    return () => clearInterval(id);
  }, [targetTimestamp]);

  const delta = state && state.phase !== 'static' ? state.delta : null;
  // Pre-mount the digits render as hidden "00" placeholders: tabular-nums
  // keeps every two-digit value the same width, so nothing shifts when the
  // real countdown appears.
  const units =
    state === null || delta
      ? [
          { v: delta ? String(delta.days).padStart(2, '0') : '00', l: tc('days') },
          { v: delta ? String(delta.hours).padStart(2, '0') : '00', l: tc('hours') },
          { v: delta ? String(delta.minutes).padStart(2, '0') : '00', l: tc('minutes') },
          { v: delta ? String(delta.seconds).padStart(2, '0') : '00', l: tc('seconds') },
        ]
      : null;

  const countdownLabel = state?.phase === 'festival' ? tc('festival') : '';

  return (
    <section className="relative h-[100svh] min-h-[680px] w-full overflow-hidden">

      {/* Background media: photo, or video with the photo as poster */}
      {mediaType === 'video' && videoSrc ? (
        <HeroBackgroundVideo src={videoSrc} poster={imageSrc} autoplay={videoAutoplay} />
      ) : (
        <Image
          src={imageSrc}
          alt={imageAlt || t('imageAlt')}
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
      )}

      {/* Gradient layers (pointer-events-none so video controls stay clickable) */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

      {/* Countdown — dead center (non-interactive, lets clicks reach the video) */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-4 pb-48 md:pb-64 hero-countdown">
          {units ? (
            <div
              className="max-w-full text-center px-5 py-7 md:px-10 md:py-10"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.25) 60%, transparent 100%)',
              }}
            >
              <div
                className="mx-auto mb-5"
                style={{ width: '40px', height: '3px', backgroundColor: 'var(--color-accent)' }}
              />
              <p
                className="uppercase text-white mb-6 tracking-[0.25em]"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  textShadow: '0 1px 8px rgba(0,0,0,0.6)',
                }}
              >
                {countdownLabel}
              </p>
              <div
                className="flex items-end justify-center gap-0"
                style={{ visibility: delta ? undefined : 'hidden' }}
              >
                {units.map(({ v, l }, i) => (
                  <div key={l} className="flex items-end">
                    {i > 0 && (
                      <span
                        className="self-start mt-2 text-white/45"
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: 'clamp(20px, 2.5vw, 36px)',
                          lineHeight: 1,
                          margin: '0 2px',
                        }}
                      >
                        :
                      </span>
                    )}
                    <div className="text-center px-2 md:px-3">
                      <div
                        className="text-white leading-none"
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontWeight: 700,
                          fontSize: 'clamp(36px, 7vw, 96px)',
                          letterSpacing: '-0.03em',
                          fontVariantNumeric: 'tabular-nums',
                          textShadow: '0 4px 32px rgba(0,0,0,0.4)',
                        }}
                      >
                        {v}
                      </div>
                      <div
                        className="mt-2 uppercase tracking-[0.18em] text-white/80"
                        style={{ fontFamily: 'var(--font-body)', fontSize: '10px' }}
                      >
                        {l}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p
              className="uppercase text-white text-center"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 'clamp(32px, 6vw, 80px)',
                lineHeight: 0.95,
                textShadow: '0 4px 24px rgba(0,0,0,0.4)',
              }}
            >
              {t('static')}
            </p>
          )}
      </div>

      {/* Race title — pinned bottom-left */}
      <div className="absolute bottom-0 left-0 right-0 max-w-full px-6 pb-10 md:px-12 md:pb-20">
        <span
          className="inline-block mb-5 md:mb-6 px-[12px] py-[6px] text-[11px] font-bold uppercase tracking-widest hero-badge"
          style={{
            backgroundColor: 'var(--color-accent)',
            color: '#111',
            borderRadius: '3px',
            transform: 'rotate(-2deg)',
            transformOrigin: 'left center',
            boxShadow: '0 2px 16px rgba(0,0,0,0.5)',
          }}
        >
          {t('badge')}
        </span>

        <h1
          className="uppercase text-white leading-none"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
          }}
        >
          <span className="block hero-line-1" style={{ fontSize: 'clamp(44px, 8vw, 96px)', lineHeight: 0.9 }}>{t('line1')}</span>
          <span className="block hero-line-2 mt-1 md:mt-2" style={{ fontSize: 'clamp(26px, 5vw, 64px)', lineHeight: 0.95 }}>{t('line2')}</span>
        </h1>

        <p
          className="mt-4 md:mt-5 uppercase text-white/75 hero-location"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            letterSpacing: '0.28em',
            textShadow: '0 1px 10px rgba(0,0,0,0.7)',
          }}
        >
          {t('location')}
        </p>

        <div className="mt-7 flex max-w-xl flex-col gap-3 sm:flex-row sm:items-center hero-actions">
          <Link
            href="/registration"
            className="inline-flex min-h-12 w-full max-w-sm items-center justify-center px-5 py-3 text-center uppercase transition-colors duration-200 hover:bg-[var(--color-accent-dark)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] sm:w-auto"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-ink)',
              fontFamily: 'var(--font-display)',
              fontSize: '22px',
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: '0.01em',
              textWrap: 'balance',
            }}
          >
            {registrationOpen ? t('registrationCtaOpen') : t('registrationCtaClosed', { opens: opensLabel })}
          </Link>
        </div>
      </div>

    </section>
  );
}
