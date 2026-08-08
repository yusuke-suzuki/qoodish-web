import privacyEn from '../content/legal/privacy.en.md';
import privacyJa from '../content/legal/privacy.ja.md';
import termsEn from '../content/legal/terms.en.md';
import termsJa from '../content/legal/terms.ja.md';

type LegalDocumentName = 'privacy' | 'terms';

type SupportedLang = 'en' | 'ja';

const documents: Record<LegalDocumentName, Record<SupportedLang, string>> = {
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
  const locale: SupportedLang = lang === 'ja' ? 'ja' : 'en';

  return documents[name][locale];
}
