'use client';

import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND
} from '@lexical/list';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  useBasicTypeaheadTriggerMatch
} from '@lexical/react/LexicalTypeaheadMenuPlugin';
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
  Notes
} from '@mui/icons-material';
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography
} from '@mui/material';
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  type ElementNode,
  type LexicalEditor,
  type TextNode
} from 'lexical';
import { type ReactNode, useCallback, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import useDictionary from '../../hooks/useDictionary';

class BlockOption extends MenuOption {
  label: string;
  keywords: string[];
  blockIcon: ReactNode;
  apply: (editor: LexicalEditor) => void;

  constructor(
    label: string,
    keywords: string[],
    blockIcon: ReactNode,
    apply: (editor: LexicalEditor) => void
  ) {
    super(label);
    this.label = label;
    this.keywords = keywords;
    this.blockIcon = blockIcon;
    this.apply = apply;
  }
}

function formatBlocks(creator: () => ElementNode) {
  const selection = $getSelection();

  if ($isRangeSelection(selection)) {
    $setBlocksType(selection, creator);
  }
}

function headingApplier(tag: HeadingTagType) {
  return (editor: LexicalEditor) => {
    editor.update(() => formatBlocks(() => $createHeadingNode(tag)));
  };
}

const tagIcon = (tag: string) => (
  <Typography variant="button" component="span" lineHeight={1}>
    {tag}
  </Typography>
);

export default function ChapterSlashMenu() {
  const [editor] = useLexicalComposerContext();
  const dictionary = useDictionary();

  const [queryString, setQueryString] = useState<string | null>(null);

  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch('/', {
    minLength: 0
  });

  const options = useMemo(() => {
    const all = [
      new BlockOption(
        dictionary.text,
        ['text', 'paragraph'],
        <Notes fontSize="small" />,
        (target) => {
          target.update(() => formatBlocks(() => $createParagraphNode()));
        }
      ),
      new BlockOption(
        dictionary['heading 2'],
        ['h2', 'heading'],
        tagIcon('H2'),
        headingApplier('h2')
      ),
      new BlockOption(
        dictionary['heading 3'],
        ['h3', 'heading'],
        tagIcon('H3'),
        headingApplier('h3')
      ),
      new BlockOption(
        dictionary['bulleted list'],
        ['ul', 'list'],
        <FormatListBulleted fontSize="small" />,
        (target) => {
          target.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
        }
      ),
      new BlockOption(
        dictionary['numbered list'],
        ['ol', 'list'],
        <FormatListNumbered fontSize="small" />,
        (target) => {
          target.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
        }
      ),
      new BlockOption(
        dictionary.quote,
        ['quote', 'blockquote'],
        <FormatQuote fontSize="small" />,
        (target) => {
          target.update(() => formatBlocks(() => $createQuoteNode()));
        }
      )
    ];

    if (!queryString) {
      return all;
    }

    const query = queryString.toLowerCase();

    return all.filter(
      (option) =>
        option.label.toLowerCase().includes(query) ||
        option.keywords.some((keyword) => keyword.includes(query))
    );
  }, [dictionary, queryString]);

  const onSelectOption = useCallback(
    (
      option: BlockOption,
      nodeToRemove: TextNode | null,
      closeMenu: () => void
    ) => {
      editor.update(() => {
        nodeToRemove?.remove();
      });

      option.apply(editor);
      closeMenu();
    },
    [editor]
  );

  return (
    <LexicalTypeaheadMenuPlugin<BlockOption>
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      triggerFn={checkForTriggerMatch}
      options={options}
      menuRenderFn={(
        anchorElementRef,
        { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }
      ) =>
        anchorElementRef.current && options.length > 0
          ? createPortal(
              <Paper
                elevation={8}
                sx={{
                  position: 'relative',
                  zIndex: 'modal',
                  mt: 3,
                  minWidth: 200,
                  overflow: 'hidden'
                }}
              >
                <List dense disablePadding>
                  {options.map((option, index) => (
                    <ListItemButton
                      key={option.key}
                      selected={index === selectedIndex}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      onClick={() => {
                        setHighlightedIndex(index);
                        selectOptionAndCleanUp(option);
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {option.blockIcon}
                      </ListItemIcon>
                      <ListItemText primary={option.label} />
                    </ListItemButton>
                  ))}
                </List>
              </Paper>,
              anchorElementRef.current
            )
          : null
      }
    />
  );
}
