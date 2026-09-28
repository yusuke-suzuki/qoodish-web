import type { SerializedEditorState } from 'lexical';
import { IMAGE_NODE_TYPE, validateUrl } from '../../utils/chapterContent.ts';
import { chapterTheme } from './chapterContentTheme.ts';

export type ChapterElementTag =
  | 'p'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'blockquote'
  | 'ul'
  | 'ol'
  | 'li'
  | 'a'
  | 'span'
  | 'strong'
  | 'em'
  | 'code'
  | 'mark'
  | 'sub'
  | 'sup'
  | 'br'
  | 'hr';

type TextAlign = 'left' | 'center' | 'right' | 'justify' | 'start' | 'end';

export type ChapterElementProps = {
  className?: string;
  dir?: 'auto' | 'ltr' | 'rtl';
  style?: { textAlign?: TextAlign; paddingInlineStart?: string };
  href?: string;
  target?: '_blank';
  rel?: string;
  title?: string;
  start?: number;
  value?: number;
  role?: 'checkbox';
  'aria-checked'?: boolean;
};

export type ChapterView =
  | { kind: 'text'; text: string }
  | { kind: 'image'; src: string }
  | {
      kind: 'element';
      tag: ChapterElementTag;
      props: ChapterElementProps;
      children: ChapterView[];
    };

type SerializedNode = Record<string, unknown>;

type Context = {
  depth: number;
  topLevel: boolean;
};

const MAX_DEPTH = 64;

const INDENT_STEP_PX = 40;

const TEXT_FORMAT = {
  bold: 1,
  italic: 1 << 1,
  strikethrough: 1 << 2,
  underline: 1 << 3,
  code: 1 << 4,
  subscript: 1 << 5,
  superscript: 1 << 6,
  highlight: 1 << 7
} as const;

const TEXT_WRAPPER_TAGS: [number, ChapterElementTag][] = [
  [TEXT_FORMAT.code, 'code'],
  [TEXT_FORMAT.highlight, 'mark'],
  [TEXT_FORMAT.subscript, 'sub'],
  [TEXT_FORMAT.superscript, 'sup']
];

const ALIGNMENTS: TextAlign[] = [
  'left',
  'center',
  'right',
  'justify',
  'start',
  'end'
];

const HEADING_TAGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;

type HeadingTag = (typeof HEADING_TAGS)[number];

const SAFE_IMAGE_URL = /^https?:\/\//i;

function isNode(value: unknown): value is SerializedNode {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function childNodes(node: SerializedNode): SerializedNode[] {
  return Array.isArray(node.children) ? node.children.filter(isNode) : [];
}

function stringField(node: SerializedNode, key: string): string | undefined {
  const value = node[key];
  return typeof value === 'string' ? value : undefined;
}

function integerField(node: SerializedNode, key: string): number | undefined {
  const value = node[key];
  return Number.isInteger(value) ? (value as number) : undefined;
}

function element(
  tag: ChapterElementTag,
  props: ChapterElementProps,
  children: ChapterView[] = []
): ChapterView {
  return { kind: 'element', tag, props, children };
}

function hasFormat(format: number, flag: number): boolean {
  return (format & flag) !== 0;
}

function textClassName(format: number): string | undefined {
  const { text } = chapterTheme;
  const underline = hasFormat(format, TEXT_FORMAT.underline);
  const strikethrough = hasFormat(format, TEXT_FORMAT.strikethrough);
  const classNames = [
    hasFormat(format, TEXT_FORMAT.bold) && text.bold,
    hasFormat(format, TEXT_FORMAT.italic) && text.italic,
    underline && strikethrough && text.underlineStrikethrough,
    underline && !strikethrough && text.underline,
    strikethrough && !underline && text.strikethrough
  ].filter((className) => typeof className === 'string');

  return classNames.length > 0 ? classNames.join(' ') : undefined;
}

function textView(text: string, format: number): ChapterView {
  const innerTag: ChapterElementTag = hasFormat(format, TEXT_FORMAT.bold)
    ? 'strong'
    : hasFormat(format, TEXT_FORMAT.italic)
      ? 'em'
      : 'span';
  const className = textClassName(format);
  const inner = element(innerTag, className ? { className } : {}, [
    { kind: 'text', text }
  ]);
  const wrapper = TEXT_WRAPPER_TAGS.find(([flag]) => hasFormat(format, flag));

  return wrapper ? element(wrapper[1], {}, [inner]) : inner;
}

function alignment(node: SerializedNode): TextAlign | undefined {
  const { format } = node;

  if (typeof format === 'string') {
    return ALIGNMENTS.find((value) => value === format);
  }

  return Number.isInteger(format)
    ? ALIGNMENTS[(format as number) - 1]
    : undefined;
}

function blockProps(
  node: SerializedNode,
  context: Context,
  className: string,
  indentable: boolean
): ChapterElementProps {
  const textAlign = alignment(node);
  const indent = indentable ? (integerField(node, 'indent') ?? 0) : 0;
  const direction = stringField(node, 'direction');
  const style = {
    ...(textAlign ? { textAlign } : {}),
    ...(indent > 0
      ? { paddingInlineStart: `${indent * INDENT_STEP_PX}px` }
      : {})
  };
  const dir =
    direction === 'ltr' || direction === 'rtl'
      ? direction
      : context.topLevel
        ? 'auto'
        : undefined;

  return {
    className,
    ...(dir ? { dir } : {}),
    ...(Object.keys(style).length > 0 ? { style } : {})
  };
}

function blockChildren(node: SerializedNode, context: Context): ChapterView[] {
  const children = childNodes(node);
  const views = mapNodes(children, nested(context));
  const endsWithLineBreak = children.at(-1)?.type === 'linebreak';

  return views.length === 0 || endsWithLineBreak
    ? [...views, element('br', {})]
    : views;
}

function nested(context: Context): Context {
  return { depth: context.depth + 1, topLevel: false };
}

function headingTag(node: SerializedNode): HeadingTag {
  const tag = stringField(node, 'tag');
  return HEADING_TAGS.find((value) => value === tag) ?? 'h2';
}

function linkViews(node: SerializedNode, context: Context): ChapterView[] {
  const children = mapNodes(childNodes(node), nested(context));
  const url = stringField(node, 'url');
  const unlinked = node.type === 'autolink' && node.isUnlinked === true;

  if (unlinked || !url || !validateUrl(url)) {
    return children;
  }

  const title = stringField(node, 'title');

  return [
    element(
      'a',
      {
        className: chapterTheme.link,
        href: url,
        target: '_blank',
        rel: 'noopener noreferrer',
        ...(title ? { title } : {})
      },
      children
    )
  ];
}

function isListNode(node: SerializedNode | undefined): boolean {
  return node?.type === 'list';
}

function listView(node: SerializedNode, context: Context): ChapterView {
  const listType = stringField(node, 'listType');
  const ordered =
    listType === undefined
      ? stringField(node, 'tag') === 'ol'
      : listType === 'number';
  const checklist = listType === 'check';
  const start = integerField(node, 'start') ?? 1;
  const itemContext = nested(context);
  let value = start;

  const items = childNodes(node).map((child) => {
    if (child.type !== 'listitem') {
      return element(
        'li',
        { className: chapterTheme.list.listitem },
        mapNode(child, itemContext)
      );
    }

    const grandchildren = childNodes(child);
    const wrapsList = isListNode(grandchildren[0]);
    const nestsList = grandchildren.some(isListNode);
    const className = nestsList
      ? `${chapterTheme.list.listitem} ${chapterTheme.list.nested.listitem}`
      : chapterTheme.list.listitem;
    const props: ChapterElementProps = {
      ...blockProps(child, itemContext, className, false),
      ...(ordered ? { value } : {}),
      ...(checklist && !wrapsList
        ? { role: 'checkbox' as const, 'aria-checked': child.checked === true }
        : {})
    };

    if (!wrapsList) {
      value += 1;
    }

    return element('li', props, blockChildren(child, itemContext));
  });

  return element(
    ordered ? 'ol' : 'ul',
    {
      className: ordered ? chapterTheme.list.ol : chapterTheme.list.ul,
      ...(ordered && start !== 1 ? { start } : {})
    },
    items
  );
}

function mapNode(node: SerializedNode, context: Context): ChapterView[] {
  if (context.depth > MAX_DEPTH) {
    return [];
  }

  switch (node.type) {
    case 'paragraph':
      return [
        element(
          'p',
          blockProps(node, context, chapterTheme.paragraph, true),
          blockChildren(node, context)
        )
      ];
    case 'heading': {
      const tag = headingTag(node);
      return [
        element(
          tag === 'h1' ? 'h2' : tag,
          blockProps(node, context, chapterTheme.heading[tag], true),
          blockChildren(node, context)
        )
      ];
    }
    case 'quote':
      return [
        element(
          'blockquote',
          blockProps(node, context, chapterTheme.quote, true),
          blockChildren(node, context)
        )
      ];
    case 'list':
      return [listView(node, context)];
    case 'link':
    case 'autolink':
      return linkViews(node, context);
    case 'text':
      return typeof node.text === 'string'
        ? [textView(node.text, integerField(node, 'format') ?? 0)]
        : [];
    case 'tab':
      return [textView('\t', integerField(node, 'format') ?? 0)];
    case 'linebreak':
      return [element('br', {})];
    case 'horizontalrule':
      return [element('hr', { className: chapterTheme.hr })];
    case IMAGE_NODE_TYPE: {
      const hero = stringField(node, 'hero');
      return hero && SAFE_IMAGE_URL.test(hero)
        ? [{ kind: 'image', src: hero }]
        : [];
    }
    default:
      if (Array.isArray(node.children)) {
        return mapNodes(childNodes(node), {
          ...context,
          depth: context.depth + 1
        });
      }

      return typeof node.text === 'string'
        ? [{ kind: 'text', text: node.text }]
        : [];
  }
}

function mapNodes(nodes: SerializedNode[], context: Context): ChapterView[] {
  return nodes.flatMap((node) => mapNode(node, context));
}

export function chapterContentTree(
  content: SerializedEditorState
): ChapterView[] {
  const root: unknown = isNode(content) ? content.root : undefined;

  return isNode(root)
    ? mapNodes(childNodes(root), { depth: 0, topLevel: true })
    : [];
}
