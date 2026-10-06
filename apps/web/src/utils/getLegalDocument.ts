import privacyEn from '../content/legal/privacy.en.md';
import privacyJa from '../content/legal/privacy.ja.md';
import terms20260824En from '../content/legal/terms/2026-08-24.en.md';
import terms20260824Ja from '../content/legal/terms/2026-08-24.ja.md';
import terms20261007En from '../content/legal/terms/2026-10-07.en.md';
import terms20261007Ja from '../content/legal/terms/2026-10-07.ja.md';
import terms20261012En from '../content/legal/terms/2026-10-12.en.md';
import terms20261012Ja from '../content/legal/terms/2026-10-12.ja.md';
import { type Locale, toLocale } from './locales.ts';
import { isBeforeEffectiveDate } from './termsRevisions.ts';

type TermsRevision = {
  effectiveOn: string;
  content: Record<Locale, string>;
};

const privacy: Record<Locale, string> = {
  en: privacyEn,
  ja: privacyJa
};

const termsRevisions: TermsRevision[] = [
  {
    effectiveOn: '2026-10-12',
    content: { en: terms20261012En, ja: terms20261012Ja }
  },
  {
    effectiveOn: '2026-10-07',
    content: { en: terms20261007En, ja: terms20261007Ja }
  },
  {
    effectiveOn: '2026-08-24',
    content: { en: terms20260824En, ja: terms20260824Ja }
  }
];

const [latestTerms, ...previousTerms] = termsRevisions;

export function getPrivacyPolicy(lang: string): string {
  return privacy[toLocale(lang)];
}

export function getTerms(lang: string): string {
  return latestTerms.content[toLocale(lang)];
}

export function getPreviousTerms(
  lang: string,
  effectiveOn: string
): string | null {
  const revision = previousTerms.find(
    (candidate) => candidate.effectiveOn === effectiveOn
  );

  return revision ? revision.content[toLocale(lang)] : null;
}

export function pendingTermsRevision(now = new Date()): string | null {
  return isBeforeEffectiveDate(latestTerms.effectiveOn, now)
    ? latestTerms.effectiveOn
    : null;
}
