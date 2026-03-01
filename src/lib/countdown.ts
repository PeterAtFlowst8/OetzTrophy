export type CountdownState =
  | { phase: 'launch'; label: 'WEBSITE LAUNCH IN'; delta: TimeDelta }
  | { phase: 'race'; label: 'RACE DAY IN'; delta: TimeDelta }
  | { phase: 'static'; label: 'COMING SEPTEMBER 2026' };

export type TimeDelta = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const LAUNCH_DATE = new Date('2026-03-15T00:00:00');

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

export function getCountdownState(now: Date, raceDate: Date | null): CountdownState {
  const launchDelta = getDelta(LAUNCH_DATE, now);
  if (launchDelta) {
    return { phase: 'launch', label: 'WEBSITE LAUNCH IN', delta: launchDelta };
  }
  if (raceDate) {
    const raceDelta = getDelta(raceDate, now);
    if (raceDelta) {
      return { phase: 'race', label: 'RACE DAY IN', delta: raceDelta };
    }
  }
  return { phase: 'static', label: 'COMING SEPTEMBER 2026' };
}
