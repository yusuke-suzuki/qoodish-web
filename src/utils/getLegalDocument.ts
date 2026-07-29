import privacyEn from '../content/legal/privacy.en.md';
import privacyJa from '../content/legal/privacy.ja.md';
import termsEn from '../content/legal/terms.en.md';
import termsJa from '../content/legal/terms.ja.md';
import { type Locale, toLocale } from './locales';

type LegalDocumentName = 'privacy' | 'terms';

const documents: Record<LegalDocumentName, Record<Locale, string>> = {
  privacy: {
    en: privacyEn,
    ja: privacyJa
  },
  terms: {
    en: termsEn,
    ja: termsJa
  }
};

export function getLegalDocument(
  name: LegalDocumentName,
  lang: string
): string {
  return documents[name][toLocale(lang)];
}
