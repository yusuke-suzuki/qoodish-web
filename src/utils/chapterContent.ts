import type { SerializedHeadingNode } from '@lexical/rich-text';
import type {
  SerializedEditorState,
  SerializedLexicalNode,
  SerializedParagraphNode,
  SerializedRootNode,
  SerializedTextNode
} from 'lexical';
import type { Image, Journey } from '../../types/index.ts';

export const IMAGE_NODE_TYPE = 'image';

export type ChapterImage = {
  image_id: number;
  url: string;
  hero: string;
};

export type SerializedImageNode = SerializedLexicalNode & {
  type: typeof IMAGE_NODE_TYPE;
} & ChapterImage;

export function createSerializedImage(
  image: ChapterImage
): SerializedImageNode {
  return {
    type: IMAGE_NODE_TYPE,
    version: 1,
    image_id: image.image_id,
    url: image.url,
    hero: image.hero
  };
}

function createSerializedText(text: string): SerializedTextNode {
  return {
    detail: 0,
    format: 0,
    mode: 'normal',
    style: '',
    text,
    type: 'text',
    version: 1
  };
}

function createSerializedParagraph(text?: string): SerializedParagraphNode {
  return {
    children: text ? [createSerializedText(text)] : [],
    direction: null,
    format: '',
    indent: 0,
    textFormat: 0,
    textStyle: '',
    type: 'paragraph',
    version: 1
  };
}

function createSerializedHeading(text: string): SerializedHeadingNode {
  return {
    children: [createSerializedText(text)],
    direction: null,
    format: '',
    indent: 0,
    tag: 'h2',
    type: 'heading',
    version: 1
  };
}

function createRoot(children: SerializedLexicalNode[]): SerializedEditorState {
  const root: SerializedRootNode = {
    children,
    direction: null,
    format: '',
    indent: 0,
    type: 'root',
    version: 1
  };

  return { root };
}

function isImageNode(node: SerializedLexicalNode): node is SerializedImageNode {
  return node.type === IMAGE_NODE_TYPE;
}

function rootChildren(content: SerializedEditorState): SerializedLexicalNode[] {
  return (content.root as SerializedRootNode).children ?? [];
}

type SerializedNodeWithChildren = SerializedLexicalNode & {
  children?: SerializedLexicalNode[];
  text?: string;
};

function hasText(node: SerializedLexicalNode): boolean {
  const { text, children } = node as SerializedNodeWithChildren;

  if (text?.trim()) {
    return true;
  }

  return (children ?? []).some(hasText);
}

export function isContentEmpty(content: SerializedEditorState): boolean {
  return rootChildren(content).every(
    (node) => !isImageNode(node) && !hasText(node)
  );
}

type ChapterSection = {
  name: string;
  images: Image[];
  note: string | null;
};

export function chapterSections(journey: Journey): ChapterSection[] {
  return journey.checkins
    .toSorted((a, b) => a.checked_in_at.localeCompare(b.checked_in_at))
    .map((checkin) => ({
      name: checkin.spot.name,
      images: checkin.images,
      note: checkin.note
    }));
}

export function createChapterContent(journey: Journey): SerializedEditorState {
  const children = chapterSections(journey).flatMap(
    ({ name, images, note }) => [
      createSerializedHeading(name),
      ...images.map((image) =>
        createSerializedImage({
          image_id: image.id,
          url: image.url,
          hero: image.hero
        })
      ),
      ...(note ? [createSerializedParagraph(note)] : [])
    ]
  );

  return createRoot(
    children.length > 0 ? children : [createSerializedParagraph()]
  );
}
