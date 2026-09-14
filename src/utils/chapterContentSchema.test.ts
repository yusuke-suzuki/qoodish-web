import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildJourney } from '../test/journeys.ts';
import {
  createChapterContent,
  createSerializedImage
} from './chapterContent.ts';
import {
  assertChapterContent,
  ChapterContentError,
  isChapterContent
} from './chapterContentSchema.ts';

function element(type: string, extra: Record<string, unknown> = {}) {
  return {
    type,
    version: 1,
    children: [],
    direction: null,
    format: '',
    indent: 0,
    ...extra
  };
}

function text(value: string, extra: Record<string, unknown> = {}) {
  return {
    type: 'text',
    version: 1,
    text: value,
    format: 0,
    detail: 0,
    mode: 'normal',
    style: '',
    ...extra
  };
}

function content(children: unknown[]) {
  return { root: element('root', { children }) };
}

function link(url: string, extra: Record<string, unknown> = {}) {
  return element('link', {
    url,
    rel: null,
    target: null,
    title: null,
    children: [text(url)],
    ...extra
  });
}

describe('assertChapterContent', () => {
  it('accepts what the editor produces for a journey', () => {
    assert.doesNotThrow(() =>
      assertChapterContent(createChapterContent(buildJourney([])))
    );
  });

  it('accepts every node type the editor registers', () => {
    const body = content([
      element('heading', { tag: 'h2', children: [text('Title')] }),
      element('paragraph', {
        children: [
          text('bold', { format: 1 }),
          { type: 'linebreak', version: 1 },
          { type: 'tab', version: 1, ...text('\t') },
          link('https://example.com'),
          link('mailto:hi@example.com', {
            type: 'autolink',
            isUnlinked: false
          })
        ]
      }),
      element('quote', { children: [text('quote')] }),
      element('list', {
        listType: 'bullet',
        tag: 'ul',
        start: 1,
        children: [element('listitem', { value: 1, children: [text('a')] })]
      }),
      { type: 'horizontalrule', version: 1 },
      createSerializedImage({
        image_id: 7,
        url: 'https://images.example.com/7/public',
        hero: 'https://images.example.com/7/hero'
      })
    ]);

    assert.doesNotThrow(() => assertChapterContent(body));
  });

  it('rejects a link that would run script', () => {
    for (const url of [
      'javascript:alert(1)',
      'JAVASCRIPT:alert(1)',
      'data:text/html,<script>alert(1)</script>',
      'vbscript:msgbox',
      ' javascript:alert(1)',
      '/relative'
    ]) {
      assert.throws(
        () => assertChapterContent(content([link(url)])),
        ChapterContentError,
        url
      );
    }
  });

  it('rejects an image that is not served over https', () => {
    const image = createSerializedImage({
      image_id: 7,
      url: 'javascript:alert(1)',
      hero: 'https://images.example.com/7/hero'
    });

    assert.throws(
      () => assertChapterContent(content([image])),
      ChapterContentError
    );
  });

  it('rejects a node type the editor does not register', () => {
    assert.throws(
      () =>
        assertChapterContent(
          content([element('code', { children: [text('x')] })])
        ),
      /unknown node type code/
    );
  });

  it('rejects a field of the wrong shape', () => {
    assert.throws(
      () => assertChapterContent(content([text(42 as unknown as string)])),
      /text: must be a string/
    );
    assert.throws(
      () =>
        assertChapterContent(
          content([element('heading', { tag: 'h7', children: [] })])
        ),
      /tag: must be one of/
    );
    assert.throws(
      () =>
        assertChapterContent(content([element('paragraph', { children: 1 })])),
      /children: must be an array/
    );
  });

  it('rejects a body that is not a tree of nodes', () => {
    assert.throws(() => assertChapterContent(null), ChapterContentError);
    assert.throws(() => assertChapterContent('{}'), ChapterContentError);
    assert.throws(() => assertChapterContent({}), ChapterContentError);
    assert.throws(
      () => assertChapterContent({ root: element('paragraph') }),
      /must be a root node/
    );
    assert.throws(
      () => assertChapterContent(content([element('root')])),
      /root may only appear at the top/
    );
  });

  it('bounds the size of a body', () => {
    let nested: Record<string, unknown> = element('paragraph');

    for (let i = 0; i < 40; i++) {
      nested = element('quote', { children: [nested] });
    }

    assert.throws(
      () => assertChapterContent(content([nested])),
      /nests deeper/
    );

    const wide = content(
      Array.from({ length: 5001 }, () => element('paragraph'))
    );

    assert.throws(() => assertChapterContent(wide), /exceeds/);
  });
});

describe('isChapterContent', () => {
  it('answers with a boolean instead of throwing', () => {
    assert.equal(isChapterContent(content([])), true);
    assert.equal(isChapterContent(content([link('javascript:x')])), false);
  });
});
