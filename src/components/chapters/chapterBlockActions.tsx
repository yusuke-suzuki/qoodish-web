'use client';

import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND
} from '@lexical/list';
import { INSERT_HORIZONTAL_RULE_COMMAND } from '@lexical/react/LexicalHorizontalRuleNode';
import {
  $createHeadingNode,
  $createQuoteNode,
  type HeadingTagType
} from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import {
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  HorizontalRule,
  Notes
} from '@mui/icons-material';
import { Typography } from '@mui/material';
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  type ElementNode,
  type LexicalEditor
} from 'lexical';
import { type ReactNode, useMemo } from 'react';
import useDictionary from '../../hooks/useDictionary';

export type BlockAction = {
  key: string;
  label: string;
  keywords: string[];
  icon: ReactNode;
  apply: (editor: LexicalEditor) => void;
};

function setBlock(editor: LexicalEditor, creator: () => ElementNode) {
  editor.update(() => {
    const selection = $getSelection();

    if ($isRangeSelection(selection)) {
      $setBlocksType(selection, creator);
    }
  });
}

function headingAction(editor: LexicalEditor, tag: HeadingTagType) {
  setBlock(editor, () => $createHeadingNode(tag));
}

const tagIcon = (tag: string) => (
  <Typography variant="button" component="span" lineHeight={1}>
    {tag}
  </Typography>
);

export function useBlockActions(): BlockAction[] {
  const dictionary = useDictionary();

  return useMemo(
    () => [
      {
        key: 'paragraph',
        label: dictionary.text,
        keywords: ['text', 'paragraph'],
        icon: <Notes fontSize="small" />,
        apply: (editor) => setBlock(editor, () => $createParagraphNode())
      },
      {
        key: 'h2',
        label: dictionary['heading 2'],
        keywords: ['h2', 'heading'],
        icon: tagIcon('H2'),
        apply: (editor) => headingAction(editor, 'h2')
      },
      {
        key: 'h3',
        label: dictionary['heading 3'],
        keywords: ['h3', 'heading'],
        icon: tagIcon('H3'),
        apply: (editor) => headingAction(editor, 'h3')
      },
      {
        key: 'ul',
        label: dictionary['bulleted list'],
        keywords: ['ul', 'list'],
        icon: <FormatListBulleted fontSize="small" />,
        apply: (editor) =>
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
      },
      {
        key: 'ol',
        label: dictionary['numbered list'],
        keywords: ['ol', 'list'],
        icon: <FormatListNumbered fontSize="small" />,
        apply: (editor) =>
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
      },
      {
        key: 'quote',
        label: dictionary.quote,
        keywords: ['quote', 'blockquote'],
        icon: <FormatQuote fontSize="small" />,
        apply: (editor) => setBlock(editor, () => $createQuoteNode())
      },
      {
        key: 'divider',
        label: dictionary.divider,
        keywords: ['divider', 'hr', 'rule'],
        icon: <HorizontalRule fontSize="small" />,
        apply: (editor) =>
          editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined)
      }
    ],
    [dictionary]
  );
}
