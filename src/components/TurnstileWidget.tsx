'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      remove: (id: string) => void;
    };
  }
}

const SCRIPT_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

type Props = {
  siteKey: string;
  locale: string;
  /** Called with the token on success, null when the token expires/errors. */
  onToken: (token: string | null) => void;
  /** Increment to reset the widget (e.g. after a failed submit consumed the token). */
  resetSignal?: number;
  onScriptError?: () => void;
};

export default function TurnstileWidget({ siteKey, locale, onToken, resetSignal = 0, onScriptError }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  const onScriptErrorRef = useRef(onScriptError);
  useEffect(() => {
    onTokenRef.current = onToken;
    onScriptErrorRef.current = onScriptError;
  });

  useEffect(() => {
    let cancelled = false;
    let scriptEl: HTMLScriptElement | null = null;

    function renderWidget() {
      if (cancelled || !containerRef.current || !window.turnstile) return;
      if (widgetIdRef.current) return; // already rendered
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        language: locale === 'de' ? 'de' : 'en',
        callback: (token: string) => onTokenRef.current(token),
        'expired-callback': () => onTokenRef.current(null),
        'error-callback': () => onTokenRef.current(null),
      });
    }

    function onScriptLoad() {
      renderWidget();
    }

    function onScriptLoadError() {
      if (!cancelled) onScriptErrorRef.current?.();
    }

    if (window.turnstile) {
      renderWidget();
    } else {
      let script = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
      if (!script) {
        script = document.createElement('script');
        script.src = SCRIPT_SRC;
        script.async = true;
        document.head.appendChild(script);
      }
      scriptEl = script;
      script.addEventListener('load', onScriptLoad);
      script.addEventListener('error', onScriptLoadError);
    }

    return () => {
      cancelled = true;
      scriptEl?.removeEventListener('load', onScriptLoad);
      scriptEl?.removeEventListener('error', onScriptLoadError);
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
    // Callbacks live in refs so caller-side inline handlers can't remount the widget (a remount forces a fresh CF challenge with real keys).
  }, [siteKey, locale]);

  useEffect(() => {
    if (resetSignal > 0 && widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
  }, [resetSignal]);

  return <div ref={containerRef} />;
}
