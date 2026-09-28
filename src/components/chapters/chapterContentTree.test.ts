import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { SerializedEditorState } from 'lexical';
import { type ChapterView, chapterContentTree } from './chapterContentTree.ts';

type Node = Record<string, unknown>;

function contentOf(nodes: unknown[]): SerializedEditorState {
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

function text(value: string, format = 0): Node {
  return {
    detail: 0,
    format,
    mode: 'normal',
    style: '',
    text: value,
    type: 'text',
    version: 1
  };
}

function block(type: string, children: Node[], extra: Node = {}): Node {
  return {
    children,
    direction: null,
    format: '',
    indent: 0,
    type,
    version: 1,
    ...extra
  };
}

function paragraph(children: Node[], extra: Node = {}): Node {
  return block('paragraph', children, extra);
}

function listItem(children: Node[], extra: Node = {}): Node {
  return block('listitem', children, { value: 1, ...extra });
}

function list(listType: string, items: Node[], extra: Node = {}): Node {
  return block('list', items, {
    listType,
    start: 1,
    tag: listType === 'number' ? 'ol' : 'ul',
    ...extra
  });
}

function link(url: string, children: Node[], extra: Node = {}): Node {
  return block('link', children, {
    url,
    rel: 'noopener noreferrer',
    target: '_blank',
    title: null,
    ...extra
  });
}

const LINEBREAK: Node = { type: 'linebreak', version: 1 };

const span = (value: string): ChapterView => ({
  kind: 'element',
  tag: 'span',
  props: {},
  children: [{ kind: 'text', text: value }]
});

const br: ChapterView = { kind: 'element', tag: 'br', props: {}, children: [] };

function tree(nodes: unknown[]): ChapterView[] {
  return chapterContentTree(contentOf(nodes));
}

function only(nodes: unknown[]): ChapterView {
  const views = tree(nodes);
  assert.equal(views.length, 1);
  return views[0];
}

function childrenOf(view: ChapterView | undefined): ChapterView[] {
  assert.equal(view?.kind, 'element');
  return view.kind === 'element' ? view.children : [];
}

function inlineOf(format: number): ChapterView {
  return childrenOf(only([paragraph([text('x', format)])]))[0];
}

function textContent(views: ChapterView[]): string {
  return views
    .map((view) => {
      if (view.kind === 'text') {
        return view.text;
      }
      return view.kind === 'element' ? textContent(view.children) : '';
    })
    .join('');
}

describe('chapterContentTree', () => {
  it('renders a top-level paragraph with the theme class and auto direction', () => {
    assert.deepEqual(tree([paragraph([text('Hello')])]), [
      {
        kind: 'element',
        tag: 'p',
        props: { className: 'journal-paragraph', dir: 'auto' },
        children: [span('Hello')]
      }
    ]);
  });

  it('keeps an explicit direction instead of auto', () => {
    const view = only([paragraph([text('שלום')], { direction: 'rtl' })]);
    assert.equal(view.kind === 'element' && view.props.dir, 'rtl');
  });

  it('gives an empty block a line break so it keeps its height', () => {
    assert.deepEqual(childrenOf(only([paragraph([])])), [br]);
  });

  it('adds a line break after a trailing line break so the last line shows', () => {
    assert.deepEqual(
      childrenOf(
        only([paragraph([text('a'), LINEBREAK, text('b'), LINEBREAK])])
      ),
      [span('a'), br, span('b'), br, br]
    );
  });

  it('maps text alignment and indentation onto the block style', () => {
    const view = only([
      paragraph([text('x')], { format: 'center', indent: 2 })
    ]);
    assert.deepEqual(view.kind === 'element' && view.props.style, {
      textAlign: 'center',
      paddingInlineStart: '80px'
    });
  });

  it('reads a legacy numeric alignment', () => {
    const view = only([paragraph([text('x')], { format: 3 })]);
    assert.deepEqual(view.kind === 'element' && view.props.style, {
      textAlign: 'right'
    });
  });

  it('ignores an unknown alignment and a negative indent', () => {
    const view = only([
      paragraph([text('x')], { format: 'sideways', indent: -1 })
    ]);
    assert.equal(view.kind === 'element' && view.props.style, undefined);
  });

  describe('text formats', () => {
    it('renders bold as strong with the bold class', () => {
      assert.deepEqual(inlineOf(1), {
        kind: 'element',
        tag: 'strong',
        props: { className: 'journal-bold' },
        children: [{ kind: 'text', text: 'x' }]
      });
    });

    it('renders italic as em with the italic class', () => {
      const view = inlineOf(2);
      assert.equal(view.kind === 'element' && view.tag, 'em');
      assert.equal(
        view.kind === 'element' && view.props.className,
        'journal-italic'
      );
    });

    it('renders bold italic as strong carrying both classes', () => {
      const view = inlineOf(3);
      assert.equal(view.kind === 'element' && view.tag, 'strong');
      assert.equal(
        view.kind === 'element' && view.props.className,
        'journal-bold journal-italic'
      );
    });

    it('renders underline and strikethrough on a span', () => {
      const underline = inlineOf(8);
      const strike = inlineOf(4);
      assert.equal(underline.kind === 'element' && underline.tag, 'span');
      assert.equal(
        underline.kind === 'element' && underline.props.className,
        'journal-underline'
      );
      assert.equal(
        strike.kind === 'element' && strike.props.className,
        'journal-strikethrough'
      );
    });

    it('combines underline and strikethrough into one decoration class', () => {
      const view = inlineOf(12);
      assert.equal(
        view.kind === 'element' && view.props.className,
        'journal-underline-strikethrough'
      );
    });

    for (const [format, tag] of [
      [16, 'code'],
      [32, 'sub'],
      [64, 'sup'],
      [128, 'mark']
    ] as const) {
      it(`wraps format ${format} in ${tag}`, () => {
        assert.deepEqual(inlineOf(format), {
          kind: 'element',
          tag,
          props: {},
          children: [span('x')]
        });
      });
    }

    it('nests the bold element inside the code wrapper', () => {
      const view = inlineOf(17);
      assert.equal(view.kind === 'element' && view.tag, 'code');
      const inner = childrenOf(view)[0];
      assert.equal(inner.kind === 'element' && inner.tag, 'strong');
    });

    it('renders a tab node as a tab character with its format', () => {
      const view = childrenOf(
        only([paragraph([{ ...text('ignored', 1), type: 'tab', detail: 2 }])])
      )[0];
      assert.deepEqual(view, {
        kind: 'element',
        tag: 'strong',
        props: { className: 'journal-bold' },
        children: [{ kind: 'text', text: '\t' }]
      });
    });
  });

  describe('headings and quotes', () => {
    it('keeps h2 to h6 and their theme classes', () => {
      const views = tree(
        ['h2', 'h3', 'h4'].map((tag) => block('heading', [text(tag)], { tag }))
      );
      assert.deepEqual(
        views.map(
          (view) => view.kind === 'element' && [view.tag, view.props.className]
        ),
        [
          ['h2', 'journal-h2'],
          ['h3', 'journal-h3'],
          ['h4', 'journal-h3']
        ]
      );
    });

    it('demotes h1 to h2 so the chapter title stays the only h1', () => {
      const view = only([block('heading', [text('Top')], { tag: 'h1' })]);
      assert.equal(view.kind === 'element' && view.tag, 'h2');
      assert.equal(
        view.kind === 'element' && view.props.className,
        'journal-h2'
      );
    });

    it('falls back to h2 for an unknown heading tag', () => {
      const view = only([block('heading', [text('?')], { tag: 'h9' })]);
      assert.equal(view.kind === 'element' && view.tag, 'h2');
    });

    it('renders a quote as a blockquote', () => {
      const view = only([block('quote', [text('Said')])]);
      assert.equal(view.kind === 'element' && view.tag, 'blockquote');
      assert.equal(
        view.kind === 'element' && view.props.className,
        'journal-quote'
      );
    });
  });

  describe('links', () => {
    for (const url of [
      'https://example.com/',
      'http://example.com/',
      'mailto:someone@example.com'
    ]) {
      it(`links ${url} into a new tab`, () => {
        const view = childrenOf(
          only([paragraph([link(url, [text('go')])])])
        )[0];
        assert.deepEqual(view, {
          kind: 'element',
          tag: 'a',
          props: {
            className: 'journal-link',
            href: url,
            target: '_blank',
            rel: 'noopener noreferrer'
          },
          children: [span('go')]
        });
      });
    }

    for (const url of [
      'javascript:alert(1)',
      'data:text/html,hi',
      '/relative',
      ''
    ]) {
      it(`renders only the text of a link to ${JSON.stringify(url)}`, () => {
        assert.deepEqual(
          childrenOf(only([paragraph([link(url, [text('go')])])])),
          [span('go')]
        );
      });
    }

    it('keeps a link title', () => {
      const view = childrenOf(
        only([
          paragraph([link('https://a.example', [text('go')], { title: 'A' })])
        ])
      )[0];
      assert.equal(view.kind === 'element' && view.props.title, 'A');
    });

    it('links an autolink and leaves an unlinked one as text', () => {
      const children = childrenOf(
        only([
          paragraph([
            {
              ...link('https://a.example', [text('a')]),
              type: 'autolink',
              isUnlinked: false
            },
            {
              ...link('https://b.example', [text('b')]),
              type: 'autolink',
              isUnlinked: true
            }
          ])
        ])
      );
      assert.equal(children[0].kind === 'element' && children[0].tag, 'a');
      assert.deepEqual(children[1], span('b'));
    });
  });

  describe('lists', () => {
    it('renders a bullet list with list item classes and no values', () => {
      const view = only([
        list('bullet', [listItem([text('a')]), listItem([text('b')])])
      ]);
      assert.deepEqual(view, {
        kind: 'element',
        tag: 'ul',
        props: { className: 'journal-ul' },
        children: [
          {
            kind: 'element',
            tag: 'li',
            props: { className: 'journal-li' },
            children: [span('a')]
          },
          {
            kind: 'element',
            tag: 'li',
            props: { className: 'journal-li' },
            children: [span('b')]
          }
        ]
      });
    });

    it('numbers an ordered list from its start, skipping nested wrappers', () => {
      const view = only([
        list(
          'number',
          [
            listItem([text('three')]),
            listItem([list('number', [listItem([text('inner')])])]),
            listItem([text('four')])
          ],
          { start: 3 }
        )
      ]);
      assert.equal(view.kind === 'element' && view.tag, 'ol');
      assert.equal(view.kind === 'element' && view.props.start, 3);
      const items = childrenOf(view);
      assert.deepEqual(
        items.map((item) => item.kind === 'element' && item.props.value),
        [3, 4, 4]
      );
      assert.equal(
        items[1].kind === 'element' && items[1].props.className,
        'journal-li journal-nested-li'
      );
      const nestedList = childrenOf(items[1])[0];
      assert.equal(nestedList.kind === 'element' && nestedList.tag, 'ol');
      assert.equal(
        nestedList.kind === 'element' && nestedList.props.start,
        undefined
      );
      assert.equal(
        nestedList.kind === 'element' && nestedList.props.dir,
        undefined
      );
    });

    it('marks leaf items of a check list as checkboxes', () => {
      const view = only([
        list('check', [
          listItem([text('done')], { checked: true }),
          listItem([text('todo')], { checked: false }),
          listItem([list('check', [listItem([text('deep')])])])
        ])
      ]);
      assert.equal(view.kind === 'element' && view.tag, 'ul');
      const items = childrenOf(view);
      assert.deepEqual(
        items.map(
          (item) =>
            item.kind === 'element' && [
              item.props.role,
              item.props['aria-checked']
            ]
        ),
        [
          ['checkbox', true],
          ['checkbox', false],
          [undefined, undefined]
        ]
      );
    });

    it('gives an empty list item a line break', () => {
      const view = only([list('bullet', [listItem([])])]);
      assert.deepEqual(childrenOf(childrenOf(view)[0]), [br]);
    });

    it('wraps a stray list child in a list item', () => {
      const view = only([list('bullet', [text('loose')])]);
      const item = childrenOf(view)[0];
      assert.equal(item.kind === 'element' && item.tag, 'li');
      assert.deepEqual(childrenOf(item), [span('loose')]);
    });

    it('reads the tag when the list type is missing', () => {
      const view = only([
        block('list', [listItem([text('a')])], { tag: 'ol', start: 1 })
      ]);
      assert.equal(view.kind === 'element' && view.tag, 'ol');
    });
  });

  it('renders a horizontal rule', () => {
    assert.deepEqual(tree([{ type: 'horizontalrule', version: 1 }]), [
      {
        kind: 'element',
        tag: 'hr',
        props: { className: 'journal-hr' },
        children: []
      }
    ]);
  });

  it('renders an image from its hero url', () => {
    assert.deepEqual(
      tree([
        {
          type: 'image',
          version: 1,
          image_id: 1,
          url: 'https://images.example.com/1/public',
          hero: 'https://images.example.com/1/hero'
        }
      ]),
      [{ kind: 'image', src: 'https://images.example.com/1/hero' }]
    );
  });

  it('drops an image without a usable hero url', () => {
    assert.deepEqual(
      tree([
        { type: 'image', version: 1 },
        { type: 'image', version: 1, hero: 'javascript:alert(1)' }
      ]),
      []
    );
  });

  describe('unexpected input', () => {
    it('renders the children of an unknown element node', () => {
      const views = tree([block('collapsible', [paragraph([text('inside')])])]);
      assert.equal(views.length, 1);
      assert.equal(views[0].kind === 'element' && views[0].tag, 'p');
    });

    it('renders the text of an unknown leaf node', () => {
      assert.deepEqual(
        childrenOf(only([paragraph([{ type: 'mention', text: '@someone' }])])),
        [{ kind: 'text', text: '@someone' }]
      );
    });

    it('renders nothing for an unknown node without text or children', () => {
      assert.deepEqual(tree([{ type: 'embed', version: 1 }]), []);
    });

    it('skips entries that are not nodes', () => {
      assert.deepEqual(
        tree([null, 'text', 3, [], paragraph([text('ok')])]).length,
        1
      );
    });

    it('skips a text node whose text is not a string', () => {
      assert.deepEqual(
        childrenOf(only([paragraph([{ type: 'text', text: 1 }])])),
        [br]
      );
    });

    for (const [label, content] of [
      ['null content', null],
      ['a missing root', {}],
      ['a root without children', { root: { type: 'root' } }],
      ['children that are not an array', { root: { children: 'nope' } }]
    ] as const) {
      it(`returns nothing for ${label}`, () => {
        assert.deepEqual(
          chapterContentTree(content as unknown as SerializedEditorState),
          []
        );
      });
    }

    it('stops descending into pathologically deep nesting', () => {
      let node: Node = text('deep');
      for (let depth = 0; depth < 10000; depth++) {
        node = block('wrapper', [node]);
      }
      assert.deepEqual(tree([node]), []);
    });
  });

  it('keeps every text of a mixed document in reading order', () => {
    const views = tree([
      block('heading', [text('Title')], { tag: 'h2' }),
      paragraph([text('One '), link('https://a.example', [text('two')])]),
      list('number', [listItem([text(' three')])]),
      block('quote', [text(' four')])
    ]);
    assert.equal(textContent(views), 'TitleOne two three four');
  });
});
