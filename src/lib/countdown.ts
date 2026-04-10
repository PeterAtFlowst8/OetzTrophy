export type CountdownState =
  | { phase: 'launch'; delta: TimeDelta }
  | { phase: 'festival'; delta: TimeDelta }
  | { phase: 'static' };

export type TimeDelta = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const LAUNCH_DATE = new Date('2026-03-15T00:00:00');
export const FESTIVAL_DATE = new Date('2026-09-17T09:00:00');
export const RACE_DATE = new Date('2026-09-19T09:00:00');

function getDelta(target: Date, now: Date): TimeDelta | null {
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

export function getCountdownState(now: Date, festivalDate: Date | null): CountdownState {
  const launchDelta = getDelta(LAUNCH_DATE, now);
  if (launchDelta) {
    return { phase: 'launch', delta: launchDelta };
  }
  if (festivalDate) {
    const festDelta = getDelta(festivalDate, now);
    if (festDelta) {
      return { phase: 'festival', delta: festDelta };
    }
  }
  return { phase: 'static' };
}
