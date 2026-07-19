'use client';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { Box, Typography } from '@mui/material';
import type { EditorState, SerializedEditorState } from 'lexical';
import { memo, useCallback } from 'react';
import type { Review } from '../../../types';
import useDictionary from '../../hooks/useDictionary';
import ChapterToolbar from './ChapterToolbar';
import {
  chapterContentStyles,
  chapterNodes,
  chapterTheme
} from './chapterEditorConfig';

type Props = {
  initialContent: SerializedEditorState;
  placeholder: string;
  reviews: Review[];
  readOnly?: boolean;
  onChange: (content: SerializedEditorState) => void;
};

function ChapterContentEditor({
  initialContent,
  placeholder,
  reviews,
  readOnly = false,
  onChange
}: Props) {
  const dictionary = useDictionary();

  const handleChange = useCallback(
    (editorState: EditorState) => {
      onChange(editorState.toJSON());
    },
    [onChange]
  );

  return (
    <LexicalComposer
      initialConfig={{
        namespace: 'journal',
        nodes: chapterNodes,
        editable: !readOnly,
        editorState: JSON.stringify(initialContent),
        theme: chapterTheme,
        onError: (error) => {
          throw error;
        }
      }}
    >
      <Box
        sx={(theme) => {
          const emptyParagraph = '.journal-paragraph:has(> br:only-child)';
          const placeholderStyle = (content: string) => ({
            position: 'relative',
            '&::before': {
              content: `"${content}"`,
              position: 'absolute',
              color: theme.palette.text.disabled,
              pointerEvents: 'none'
            },
            // The absolute ::before cannot grow the one-line paragraph, so
            // wrapped placeholder lines would overlap the block below. The
            // hidden in-flow copy reserves the wrapped height; the negative
            // margin cancels the line the caret already occupies.
            '&::after': {
              content: `"${content}"`,
              display: 'block',
              visibility: 'hidden',
              marginTop: `calc(-1em * ${theme.typography.body1.lineHeight})`
            }
          });

          return {
            position: 'relative',
            '& .journal-editor-input': {
              outline: 'none',
              minHeight: 120,
              ...theme.typography.body1
            },
            ...chapterContentStyles(theme),
            '& .journal-editor-input[contenteditable="true"]': {
              [`& .journal-spot + ${emptyParagraph}:not(:last-child)`]:
                placeholderStyle(dictionary['chapter spot placeholder']),
              [`& ${emptyParagraph}:last-child`]: placeholderStyle(
                dictionary['chapter closing placeholder']
              ),
              [`& .journal-journey + ${emptyParagraph}, & ${emptyParagraph}:first-child`]:
                placeholderStyle(dictionary['chapter opening placeholder'])
            }
          };
        }}
      >
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className="journal-editor-input"
              aria-placeholder={placeholder}
              placeholder={
                readOnly ? null : (
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      pointerEvents: 'none'
                    }}
                  >
                    {placeholder}
                  </Typography>
                )
              }
            />
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <ListPlugin />
        {!readOnly && (
          <>
            <HistoryPlugin />
            <OnChangePlugin ignoreSelectionChange onChange={handleChange} />
          </>
        )}
      </Box>

      {!readOnly && <ChapterToolbar reviews={reviews} />}
    </LexicalComposer>
  );
}

export default memo(ChapterContentEditor);
