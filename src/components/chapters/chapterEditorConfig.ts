import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import {
  BOLD_ITALIC_STAR,
  BOLD_ITALIC_UNDERSCORE,
  BOLD_STAR,
  BOLD_UNDERSCORE,
  type ElementTransformer,
  HEADING,
  ITALIC_STAR,
  ITALIC_UNDERSCORE,
  LINK,
  ORDERED_LIST,
  QUOTE,
  STRIKETHROUGH,
  type Transformer,
  UNORDERED_LIST
} from '@lexical/markdown';
import { createLinkMatcherWithRegExp } from '@lexical/react/LexicalAutoLinkPlugin';
import {
  $createHorizontalRuleNode,
  $isHorizontalRuleNode,
  HorizontalRuleNode
} from '@lexical/react/LexicalHorizontalRuleNode';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import type { Theme } from '@mui/material';
import type { EditorThemeClasses, Klass, LexicalNode } from 'lexical';
import { ImageNode } from './ImageNode';

export const chapterNodes: Klass<LexicalNode>[] = [
  ImageNode,
  HeadingNode,
  QuoteNode,
  ListNode,
  ListItemNode,
  HorizontalRuleNode,
  LinkNode,
  AutoLinkNode
];

// The markdown HEADING transformer can produce any of h1-h6; the journal's
// visual scale only has two heading sizes, so the outliers alias to them.
export const chapterTheme: EditorThemeClasses = {
  paragraph: 'journal-paragraph',
  heading: {
    h1: 'journal-h2',
    h2: 'journal-h2',
    h3: 'journal-h3',
    h4: 'journal-h3',
    h5: 'journal-h3',
    h6: 'journal-h3'
  },
  quote: 'journal-quote',
  hr: 'journal-hr',
  list: {
    ul: 'journal-ul',
    ol: 'journal-ol',
    listitem: 'journal-li'
  },
  link: 'journal-link',
  text: {
    bold: 'journal-bold',
    italic: 'journal-italic',
    underline: 'journal-underline',
    strikethrough: 'journal-strikethrough'
  }
};

const HORIZONTAL_RULE: ElementTransformer = {
  dependencies: [HorizontalRuleNode],
  export: (node) => ($isHorizontalRuleNode(node) ? '---' : null),
  regExp: /^(-{3,}|\*{3,}|_{3,})\s?$/,
  replace: (parentNode, _nodes, _match, isImport) => {
    const line = $createHorizontalRuleNode();

    if (isImport || parentNode.getNextSibling() != null) {
      parentNode.replace(line);
    } else {
      parentNode.insertBefore(line);
    }

    line.selectNext();
  },
  type: 'element'
};

// CODE and inline-code transformers are left out: CodeNode is not registered
// and the theme has no code styling.
export const chapterMarkdownTransformers: Transformer[] = [
  HEADING,
  QUOTE,
  UNORDERED_LIST,
  ORDERED_LIST,
  BOLD_ITALIC_STAR,
  BOLD_ITALIC_UNDERSCORE,
  BOLD_STAR,
  BOLD_UNDERSCORE,
  ITALIC_STAR,
  ITALIC_UNDERSCORE,
  STRIKETHROUGH,
  LINK,
  HORIZONTAL_RULE
];

const SAFE_URL_PROTOCOL = /^(https?:\/\/|mailto:)/i;

export function validateUrl(url: string): boolean {
  return SAFE_URL_PROTOCOL.test(url);
}

const URL_PATTERN =
  /((https?:\/\/(www\.)?)|(www\.))[-\w@:%.+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b[-\w()@:%+.~#?&/=]*/;
const EMAIL_PATTERN =
  /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;

export const chapterAutoLinkMatchers = [
  createLinkMatcherWithRegExp(URL_PATTERN, (text) =>
    text.startsWith('http') ? text : `https://${text}`
  ),
  createLinkMatcherWithRegExp(EMAIL_PATTERN, (text) => `mailto:${text}`)
];

export const chapterContentStyles = (theme: Theme) => ({
  '& .journal-paragraph': {
    margin: 0,
    marginBottom: theme.spacing(2),
    whiteSpace: 'pre-wrap'
  },
  '& .journal-h2': {
    ...theme.typography.h5,
    margin: 0,
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(1.5)
  },
  '& .journal-h3': {
    ...theme.typography.h6,
    margin: 0,
    marginTop: theme.spacing(2.5),
    marginBottom: theme.spacing(1)
  },
  '& .journal-quote': {
    margin: 0,
    marginBottom: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    borderLeft: `4px solid ${theme.palette.divider}`,
    color: theme.palette.text.secondary,
    fontStyle: 'italic'
  },
  '& .journal-ul, & .journal-ol': {
    margin: 0,
    marginBottom: theme.spacing(2),
    paddingLeft: theme.spacing(3)
  },
  '& .journal-li': {
    marginBottom: theme.spacing(0.5)
  },
  '& .journal-hr': {
    border: 'none',
    borderTop: `1px solid ${theme.palette.divider}`,
    margin: theme.spacing(3, 0)
  },
  '& .journal-block-placeholder': {
    position: 'relative'
  },
  '& .journal-block-placeholder::before': {
    content: 'attr(data-placeholder)',
    position: 'absolute',
    top: 0,
    left: 0,
    color: theme.palette.text.disabled,
    pointerEvents: 'none'
  },
  '& .journal-link': {
    color: theme.palette.primary.main,
    textDecoration: 'underline',
    cursor: 'pointer'
  },
  '& .journal-bold': { fontWeight: 700 },
  '& .journal-italic': { fontStyle: 'italic' },
  '& .journal-underline': { textDecoration: 'underline' },
  '& .journal-strikethrough': { textDecoration: 'line-through' }
});
