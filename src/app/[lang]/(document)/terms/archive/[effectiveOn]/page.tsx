import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import MarkdownContent from '../../../../../../components/common/MarkdownContent.tsx';
import PreviousTermsNotice from '../../../../../../components/legal/PreviousTermsNotice.tsx';
import { getDictionary } from '../../../../../../utils/getDictionary.ts';
import { getPreviousTerms } from '../../../../../../utils/getLegalDocument.ts';
import { buildAlternates } from '../../../../../../utils/metadata.ts';
import { formatEffectiveDate } from '../../../../../../utils/termsRevisions.ts';

type Props = {
  params: Promise<{ lang: string; effectiveOn: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, effectiveOn } = await params;
  const dict = getDictionary(lang);

  if (!getPreviousTerms(lang, effectiveOn)) return {};

  return {
    title: `${dict['terms of service']} (${formatEffectiveDate(lang, effectiveOn)}) | Qoodish`,
    alternates: buildAlternates(lang, `/terms/archive/${effectiveOn}`),
    robots: { index: false }
  };
}

export default async function PreviousTermsPage({ params }: Props) {
  const { lang, effectiveOn } = await params;
  const content = getPreviousTerms(lang, effectiveOn);

  if (!content) notFound();

  return (
    <>
      <PreviousTermsNotice date={formatEffectiveDate(lang, effectiveOn)} />
      <MarkdownContent content={content} />
    </>
  );
}
