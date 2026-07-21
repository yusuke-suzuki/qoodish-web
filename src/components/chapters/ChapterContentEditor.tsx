'use client';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { Box, Typography } from '@mui/material';
import type { EditorState, SerializedEditorState } from 'lexical';
import { memo, useCallback } from 'react';
import ChapterSlashMenu from './ChapterSlashMenu';
import ChapterToolbar from './ChapterToolbar';
import {
  chapterContentStyles,
  chapterMarkdownTransformers,
  chapterNodes,
  chapterTheme
} from './chapterEditorConfig';

type Props = {
  initialContent: SerializedEditorState;
  placeholder: string;
  readOnly?: boolean;
  onChange: (content: SerializedEditorState) => void;
};

function ChapterContentEditor({
  initialContent,
  placeholder,
  readOnly = false,
  onChange
}: Props) {
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
        sx={(theme) => ({
          position: 'relative',
          '& .journal-editor-input': {
            outline: 'none',
            minHeight: 120,
            ...theme.typography.body1
          },
          ...chapterContentStyles(theme)
        })}
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
            <MarkdownShortcutPlugin
              transformers={chapterMarkdownTransformers}
            />
            <ChapterSlashMenu />
            <OnChangePlugin ignoreSelectionChange onChange={handleChange} />
          </>
        )}
      </Box>

      {!readOnly && <ChapterToolbar />}
    </LexicalComposer>
  );
}

export default memo(ChapterContentEditor);
