'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

type Props = {
  value: string;
  className?: string;
  style?: React.CSSProperties;
};

export default function CountUp({ value, className = '', style }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const [display, setDisplay] = useState(value);

  // Check if value is a pure number
  const numericValue = parseInt(value, 10);
  const isNumeric = !isNaN(numericValue) && String(numericValue) === value.trim();

  useEffect(() => {
    if (!isInView || !isNumeric) {
      if (isInView) setDisplay(value);
      return;
    }

    const duration = 1200;
    const startTime = performance.now();
    const target = numericValue;

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      setDisplay(String(current));

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }, [isInView, isNumeric, numericValue, value]);

  return (
    <span ref={ref} className={className} style={style}>
      {isInView ? display : isNumeric ? '0' : value}
    </span>
  );
}
