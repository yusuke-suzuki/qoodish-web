import type { StructuredData } from '../../utils/structuredData.ts';

type Props = {
  data: StructuredData | null;
};

export default function JsonLd({ data }: Props) {
  if (!data) {
    return null;
  }

  return (
    <script
      type="application/ld+json"
      // Author-supplied text reaches this script element, where a literal
      // `<` would close it early; escaping it keeps the payload inert.
      // biome-ignore lint/security/noDangerouslySetInnerHtml: a JSON-LD payload has to be raw text inside the script element
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c')
      }}
    />
  );
}
