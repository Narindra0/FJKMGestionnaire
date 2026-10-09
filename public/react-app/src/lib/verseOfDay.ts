export type Verse = {
  id: number;
  ref: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  theme: "foi" | "paix" | "esperance" | "sagesse" | "amour" | "provision" | "service" | "ordre";
};

export type VerseCorpus = {
  version: string;
  translation: string;
  source: string;
  sourceCommit: string;
  license: string;
  verses: Verse[];
};

const MS_PER_DAY = 86_400_000;
const ANTANANARIVO_OFFSET_MS = 3 * 60 * 60 * 1000;

/** Jour civil courant à Antananarivo, indépendant du fuseau du navigateur. */
export function getAntananarivoDate(now: Date = new Date()): Date {
  return new Date(now.getTime() + ANTANANARIVO_OFFSET_MS);
}

/** Nombre de jours depuis 1970-01-01 à minuit dans le calendrier local FJKM. */
export function dayNumber(now: Date = new Date()): number {
  const local = getAntananarivoDate(now);
  return Math.floor(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()) / MS_PER_DAY);
}

function gcd(a: number, b: number): number {
  while (b !== 0) [a, b] = [b, a % b];
  return Math.abs(a);
}

/** Plus petit pas non trivial et premier avec la taille du corpus. */
export function pickStep(total: number): number {
  if (total <= 2) return 1;
  for (let candidate = 2; candidate < total; candidate += 1) {
    if (gcd(candidate, total) === 1 && candidate !== total - 1) return candidate;
  }
  return 1;
}

/** Permutation déterministe qui visite chaque position avant répétition. */
export function verseIndex(day: number, total: number): number {
  if (!Number.isInteger(total) || total <= 0) return -1;
  const step = pickStep(total);
  const remainder = ((day % total) + total) % total;
  return (remainder * step) % total;
}

export function dayOfYear(day: number): number {
  const date = new Date(day * MS_PER_DAY);
  const startOfYear = Date.UTC(date.getUTCFullYear(), 0, 1);
  return Math.floor((day * MS_PER_DAY - startOfYear) / MS_PER_DAY) + 1;
}

export type DailyVerse = Verse & { dayNumber: number; dayOfYear: number };

export function getVerseOfTheDay(verses: Verse[], now: Date = new Date()): DailyVerse | null {
  if (!Array.isArray(verses) || verses.length === 0) return null;
  const day = dayNumber(now);
  const index = verseIndex(day, verses.length);
  if (index < 0 || !verses[index]) return null;
  return { ...verses[index], dayNumber: day, dayOfYear: dayOfYear(day) };
}

export function formatAntananarivoDate(now: Date = new Date()): string {
  const local = getAntananarivoDate(now);
  const day = String(local.getUTCDate()).padStart(2, "0");
  const month = String(local.getUTCMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${local.getUTCFullYear()}`;
}

export function isoAntananarivoDate(now: Date = new Date()): string {
  const local = getAntananarivoDate(now);
  const year = local.getUTCFullYear();
  const month = String(local.getUTCMonth() + 1).padStart(2, "0");
  const day = String(local.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Délai avant le prochain minuit du calendrier d'Antananarivo. */
export function millisecondsUntilNextAntananarivoMidnight(now: Date = new Date()): number {
  const localTime = (now.getTime() + ANTANANARIVO_OFFSET_MS) % MS_PER_DAY;
  return MS_PER_DAY - localTime;
}
