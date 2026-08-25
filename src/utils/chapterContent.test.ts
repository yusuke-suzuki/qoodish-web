import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { SerializedEditorState } from 'lexical';
import type { Image, Journey, JourneyCheckin } from '../../types';
import {
  chapterSections,
  createChapterContent,
  createSerializedImage,
  isContentEmpty
} from './chapterContent';

function buildImage(id: number): Image {
  return {
    id,
    url: `https://images.example.com/${id}/public`,
    avatar: `https://images.example.com/${id}/avatar`,
    card: `https://images.example.com/${id}/card`,
    hero: `https://images.example.com/${id}/hero`,
    ogp: `https://images.example.com/${id}/ogp`
  };
}

function buildCheckin(
  id: number,
  checkedInAt: string,
  overrides: Partial<JourneyCheckin> = {}
): JourneyCheckin {
  return {
    id,
    review_id: id * 100,
    spot: { name: `Spot ${id}`, latitude: 35, longitude: 139 },
    checked_in_at: checkedInAt,
    note: null,
    images: [],
    ...overrides
  };
}

function buildJourney(checkins: JourneyCheckin[]): Journey {
  return {
    id: 1,
    map_id: 10,
    started_at: '2026-08-01T00:00:00Z',
    finished_at: null,
    milestones: [],
    checkins,
    encoded_path: null,
    chapter_id: null,
    map: null,
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-01T00:00:00Z'
  };
}

function contentOf(nodes: Record<string, unknown>[]): SerializedEditorState {
  return {
    root: {
      children: nodes,
      direction: null,
      format: '',
      indent: 0,
      type: 'root',
      version: 1
    }
  } as unknown as SerializedEditorState;
}

describe('createSerializedImage', () => {
  it('builds an image node carrying the chapter image fields', () => {
    const image = {
      image_id: 7,
      url: 'https://images.example.com/7/public',
      hero: 'https://images.example.com/7/hero'
    };

    assert.deepEqual(createSerializedImage(image), {
      type: 'image',
      version: 1,
      ...image
    });
  });
});

describe('isContentEmpty', () => {
  it('treats a lone empty paragraph as empty', () => {
    assert.equal(isContentEmpty(createChapterContent(buildJourney([]))), true);
  });

  it('treats whitespace-only text as empty', () => {
    const content = contentOf([
      {
        type: 'paragraph',
        version: 1,
        children: [{ type: 'text', version: 1, text: '  \n ' }]
      }
    ]);

    assert.equal(isContentEmpty(content), true);
  });

  it('finds text nested below the top level', () => {
    const content = contentOf([
      {
        type: 'list',
        version: 1,
        children: [
          {
            type: 'listitem',
            version: 1,
            children: [{ type: 'text', version: 1, text: 'note' }]
          }
        ]
      }
    ]);

    assert.equal(isContentEmpty(content), false);
  });

  it('counts an image as content', () => {
    const content = contentOf([
      createSerializedImage({
        image_id: 7,
        url: 'https://images.example.com/7/public',
        hero: 'https://images.example.com/7/hero'
      }) as unknown as Record<string, unknown>
    ]);

    assert.equal(isContentEmpty(content), false);
  });
});

describe('chapterSections', () => {
  it('orders sections by check-in time and keeps their fields', () => {
    const image = buildImage(7);

    const journey = buildJourney([
      buildCheckin(2, '2026-08-02T00:00:00Z', { note: 'second' }),
      buildCheckin(1, '2026-08-01T00:00:00Z', { images: [image] })
    ]);

    assert.deepEqual(chapterSections(journey), [
      { name: 'Spot 1', images: [image], note: null },
      { name: 'Spot 2', images: [], note: 'second' }
    ]);
  });
});

describe('createChapterContent', () => {
  it('lays out heading, images, and note per check-in', () => {
    const image = buildImage(7);

    const journey = buildJourney([
      buildCheckin(1, '2026-08-01T00:00:00Z', {
        images: [image],
        note: 'great view'
      })
    ]);

    const { root } = createChapterContent(journey);
    const [heading, imageNode, paragraph] = root.children;

    assert.equal(root.children.length, 3);

    assert.deepEqual(heading, {
      children: [
        {
          detail: 0,
          format: 0,
          mode: 'normal',
          style: '',
          text: 'Spot 1',
          type: 'text',
          version: 1
        }
      ],
      direction: null,
      format: '',
      indent: 0,
      tag: 'h2',
      type: 'heading',
      version: 1
    });

    assert.deepEqual(imageNode, {
      type: 'image',
      version: 1,
      image_id: image.id,
      url: image.url,
      hero: image.hero
    });

    assert.equal(paragraph.type, 'paragraph');
  });

  it('omits the note paragraph when a check-in has no note', () => {
    const journey = buildJourney([buildCheckin(1, '2026-08-01T00:00:00Z')]);

    const { root } = createChapterContent(journey);

    assert.deepEqual(
      root.children.map((node) => node.type),
      ['heading']
    );
  });

  it('falls back to a single empty paragraph for an empty journey', () => {
    const { root } = createChapterContent(buildJourney([]));

    assert.equal(root.children.length, 1);
    assert.equal(root.children[0].type, 'paragraph');
  });
});
