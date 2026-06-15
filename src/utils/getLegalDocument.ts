import { readFile } from 'node:fs/promises';
import path from 'node:path';

type LegalDocumentName = 'privacy' | 'terms';

const SUPPORTED_LANGS = ['en', 'ja'];

export async function getLegalDocument(
  name: LegalDocumentName,
  lang: string
): Promise<string> {
  const locale = SUPPORTED_LANGS.includes(lang) ? lang : 'en';
  const filePath = path.join(
    process.cwd(),
    'src/content/legal',
    `${name}.${locale}.md`
  );

  return readFile(filePath, 'utf-8');
}
