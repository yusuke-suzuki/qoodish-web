'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  useBasicTypeaheadTriggerMatch
} from '@lexical/react/LexicalTypeaheadMenuPlugin';
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper
} from '@mui/material';
import type { TextNode } from 'lexical';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { type BlockAction, useBlockActions } from './chapterBlockActions.tsx';

class BlockOption extends MenuOption {
  action: BlockAction;

  constructor(action: BlockAction) {
    super(action.key);
    this.action = action;
  }
}

export default function ChapterSlashMenu() {
  const [editor] = useLexicalComposerContext();
  const actions = useBlockActions();

  const [queryString, setQueryString] = useState<string | null>(null);

  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch('/', {
    minLength: 0
  });

  const allOptions = actions.map((action) => new BlockOption(action));
  const query = queryString?.toLowerCase();

  const options = query
    ? allOptions.filter(
        (option) =>
          option.action.label.toLowerCase().includes(query) ||
          option.action.keywords.some((keyword) => keyword.includes(query))
      )
    : allOptions;

  const onSelectOption = (
    option: BlockOption,
    nodeToRemove: TextNode | null,
    closeMenu: () => void
  ) => {
    editor.update(() => {
      nodeToRemove?.remove();
    });

    option.action.apply(editor);
    closeMenu();
  };

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
                        {option.action.icon}
                      </ListItemIcon>
                      <ListItemText primary={option.action.label} />
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
