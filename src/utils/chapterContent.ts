import type { SerializedHeadingNode } from '@lexical/rich-text';
import type {
  SerializedEditorState,
  SerializedLexicalNode,
  SerializedParagraphNode,
  SerializedRootNode,
  SerializedTextNode
} from 'lexical';
import type { Image, Journey, JourneyPathPoint, SpotAnchor } from '../../types';

export const SPOT_NODE_TYPE = 'spot';
export const JOURNEY_NODE_TYPE = 'journey';
export const IMAGE_NODE_TYPE = 'image';

export type SerializedSpotNode = SerializedLexicalNode & {
  type: typeof SPOT_NODE_TYPE;
  review_id: number;
  name: string;
  latitude: number;
  longitude: number;
  checked_in_at: string | null;
};

export type SerializedJourneyNode = SerializedLexicalNode & {
  type: typeof JOURNEY_NODE_TYPE;
  journey_id: number | null;
  path: JourneyPathPoint[];
};

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

export function createSerializedParagraph(
  text?: string
): SerializedParagraphNode {
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

export function createSerializedSpot(anchor: SpotAnchor): SerializedSpotNode {
  return {
    type: SPOT_NODE_TYPE,
    version: 1,
    review_id: anchor.review_id,
    name: anchor.name,
    latitude: anchor.latitude,
    longitude: anchor.longitude,
    checked_in_at: anchor.checked_in_at
  };
}

export function createSerializedJourney(
  journeyId: number | null,
  path: JourneyPathPoint[]
): SerializedJourneyNode {
  return {
    type: JOURNEY_NODE_TYPE,
    version: 1,
    journey_id: journeyId,
    path
  };
}

export function createRoot(
  children: SerializedLexicalNode[]
): SerializedEditorState {
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

function isSpotNode(node: SerializedLexicalNode): node is SerializedSpotNode {
  return node.type === SPOT_NODE_TYPE;
}

function isImageNode(node: SerializedLexicalNode): node is SerializedImageNode {
  return node.type === IMAGE_NODE_TYPE;
}

function rootChildren(content: SerializedEditorState): SerializedLexicalNode[] {
  return (content.root as SerializedRootNode).children ?? [];
}

export function hasJourneyNode(content: SerializedEditorState): boolean {
  return rootChildren(content).some((node) => node.type === JOURNEY_NODE_TYPE);
}

export function extractSpots(content: SerializedEditorState): SpotAnchor[] {
  return rootChildren(content)
    .filter(isSpotNode)
    .map((node) => ({
      review_id: node.review_id,
      name: node.name,
      latitude: node.latitude,
      longitude: node.longitude,
      checked_in_at: node.checked_in_at
    }));
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
    (node) => !isSpotNode(node) && !isImageNode(node) && !hasText(node)
  );
}

export function createChapterContent(journey: Journey): SerializedEditorState {
  const checkinByReviewId = new Map(
    journey.checkins
      .slice()
      .reverse()
      .map((checkin) => [checkin.review_id, checkin])
  );

  const milestoneReviewIds = new Set(
    journey.milestones.map((milestone) => milestone.review_id)
  );

  type Section = { name: string; images: Image[]; note: string | null };

  const sections: Section[] = [
    ...journey.milestones.map((milestone) => {
      const checkin = checkinByReviewId.get(milestone.review_id);

      return {
        name: milestone.name,
        images: checkin?.images ?? [],
        note: checkin?.note ?? null
      };
    }),
    ...journey.checkins
      .filter((checkin) => !milestoneReviewIds.has(checkin.review_id))
      .sort((a, b) => a.checked_in_at.localeCompare(b.checked_in_at))
      .map((checkin) => ({
        name: checkin.spot.name,
        images: checkin.images,
        note: checkin.note
      }))
  ];

  return createRoot([
    createSerializedParagraph(),
    ...sections.flatMap(({ name, images, note }) => [
      createSerializedHeading(name),
      ...images.map((image) =>
        createSerializedImage({
          image_id: image.id,
          url: image.url,
          hero: image.hero
        })
      ),
      createSerializedParagraph(note ?? undefined)
    ])
  ]);
}
