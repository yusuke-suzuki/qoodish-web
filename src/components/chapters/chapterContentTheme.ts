import type { Theme } from '@mui/material';
import type { EditorThemeClasses } from 'lexical';

// The markdown HEADING transformer can produce any of h1-h6; the journal's
// visual scale only has two heading sizes, so the outliers alias to them.
export const chapterTheme = {
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
    listitem: 'journal-li',
    nested: {
      listitem: 'journal-nested-li'
    }
  },
  link: 'journal-link',
  text: {
    bold: 'journal-bold',
    italic: 'journal-italic',
    underline: 'journal-underline',
    strikethrough: 'journal-strikethrough',
    underlineStrikethrough: 'journal-underline-strikethrough'
  }
} satisfies EditorThemeClasses;

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
  '& .journal-nested-li': {
    listStyleType: 'none'
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
  '& .journal-strikethrough': { textDecoration: 'line-through' },
  '& .journal-underline-strikethrough': {
    textDecoration: 'underline line-through'
  }
});
