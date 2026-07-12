import { ListItemNode, ListNode } from '@lexical/list';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import type { Theme } from '@mui/material';
import type { EditorThemeClasses, Klass, LexicalNode } from 'lexical';
import { ImageNode } from './ImageNode';
import { JourneyNode } from './JourneyNode';
import { SpotNode } from './SpotNode';

export const chapterNodes: Klass<LexicalNode>[] = [
  SpotNode,
  JourneyNode,
  ImageNode,
  HeadingNode,
  QuoteNode,
  ListNode,
  ListItemNode
];

export const chapterTheme: EditorThemeClasses = {
  paragraph: 'journal-paragraph',
  heading: {
    h2: 'journal-h2',
    h3: 'journal-h3'
  },
  quote: 'journal-quote',
  list: {
    ul: 'journal-ul',
    ol: 'journal-ol',
    listitem: 'journal-li'
  },
  text: {
    bold: 'journal-bold',
    italic: 'journal-italic',
    underline: 'journal-underline',
    strikethrough: 'journal-strikethrough'
  }
};

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
  '& .journal-bold': { fontWeight: 700 },
  '& .journal-italic': { fontStyle: 'italic' },
  '& .journal-underline': { textDecoration: 'underline' },
  '& .journal-strikethrough': { textDecoration: 'line-through' }
});
