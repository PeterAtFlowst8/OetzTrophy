import { describe, it, expect } from 'vitest';
import { getCountdownState } from './countdown';

describe('getCountdownState', () => {
  it('returns launch phase when before launch date', () => {
    const now = new Date('2026-03-01T12:00:00');
    const state = getCountdownState(now, null);
    expect(state.phase).toBe('launch');
    if (state.phase === 'launch') {
      expect(state.delta.days).toBeGreaterThan(0);
    }
  });

  it('returns festival phase when after launch and festival date is set', () => {
    const now = new Date('2026-03-20T12:00:00');
    const festivalDate = new Date('2026-09-15T09:00:00');
    const state = getCountdownState(now, festivalDate);
    expect(state.phase).toBe('festival');
  });

  it('returns static when after launch and no festival date', () => {
    const now = new Date('2026-03-20T12:00:00');
    const state = getCountdownState(now, null);
    expect(state.phase).toBe('static');
  });

  it('returns static when festival has already passed', () => {
    const now = new Date('2026-09-20T12:00:00');
    const festivalDate = new Date('2026-09-15T09:00:00');
    const state = getCountdownState(now, festivalDate);
    expect(state.phase).toBe('static');
  });

  it('delta units never overflow their bounds', () => {
    const now = new Date('2026-03-01T12:00:00');
    const state = getCountdownState(now, null);
    if (state.phase === 'launch') {
      expect(state.delta.seconds).toBeLessThan(60);
      expect(state.delta.minutes).toBeLessThan(60);
      expect(state.delta.hours).toBeLessThan(24);
    }
  });
});
