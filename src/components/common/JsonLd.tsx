import {
  type JsonLd as JsonLdData,
  serializeJsonLd
} from '../../utils/structuredData.ts';

type Props = {
  data: JsonLdData | JsonLdData[];
};

export default function JsonLd({ data }: Props) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is only readable as raw script text, and serializeJsonLd escapes what could close the tag.
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
