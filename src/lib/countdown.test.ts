import { describe, it, expect } from 'vitest';
import { getCountdownState } from './countdown';

describe('getCountdownState', () => {
  it('returns festival phase when the festival date is in the future', () => {
    const now = new Date('2026-03-20T12:00:00');
    const festivalDate = new Date('2026-09-15T09:00:00');
    const state = getCountdownState(now, festivalDate);
    expect(state.phase).toBe('festival');
    if (state.phase === 'festival') {
      expect(state.delta.days).toBeGreaterThan(0);
    }
  });

  it('returns static when no festival date is set', () => {
    const now = new Date('2026-03-20T12:00:00');
    const state = getCountdownState(now, null);
    expect(state.phase).toBe('static');
  });

  it('returns static when the festival has already passed', () => {
    const now = new Date('2026-09-20T12:00:00');
    const festivalDate = new Date('2026-09-15T09:00:00');
    const state = getCountdownState(now, festivalDate);
    expect(state.phase).toBe('static');
  });

  it('delta units never overflow their bounds', () => {
    const now = new Date('2026-03-01T12:00:00');
    const festivalDate = new Date('2026-09-15T09:00:00');
    const state = getCountdownState(now, festivalDate);
    expect(state.phase).toBe('festival');
    if (state.phase === 'festival') {
      expect(state.delta.seconds).toBeLessThan(60);
      expect(state.delta.minutes).toBeLessThan(60);
      expect(state.delta.hours).toBeLessThan(24);
    }
  });
});
