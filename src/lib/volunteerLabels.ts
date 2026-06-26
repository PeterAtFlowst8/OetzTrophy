/**
 * Single source of truth mapping stable volunteer role/day keys → built-in
 * English labels, used by the admin table, the CSV export and the organiser
 * notification email. Submissions store the stable keys; these labels are for
 * display only (the public form shows the DE/EN labels from the i18n catalog).
 */
import enMessages from '../../messages/en.json';

const vs = (enMessages as Record<string, Record<string, string>>).volunteerSignup;

export const ROLE_LABELS: Record<string, string> = {
  media: vs.roleMedia,
  registration: vs.roleRegistration,
  safety: vs.roleSafety,
  first_aid: vs.roleFirstAid,
};

export const DAY_LABELS: Record<string, string> = {
  thu: vs.dayThu,
  fri: vs.dayFri,
  sat: vs.daySat,
  sun: vs.daySun,
};

export const roleLabel = (key: string): string => ROLE_LABELS[key] ?? key;
export const dayLabel = (key: string): string => DAY_LABELS[key] ?? key;
export const roleLabels = (keys: string[]): string[] => keys.map(roleLabel);
export const dayLabels = (keys: string[]): string[] => keys.map(dayLabel);
