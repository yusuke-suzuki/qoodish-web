'use client';

import { ClickableLinkPlugin } from '@lexical/react/LexicalClickableLinkPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { Box } from '@mui/material';
import type { SerializedEditorState } from 'lexical';
import { memo } from 'react';
import {
  chapterContentStyles,
  chapterNodes,
  chapterTheme,
  validateUrl
} from './chapterEditorConfig';

type Props = {
  content: SerializedEditorState;
};

function ChapterContentReader({ content }: Props) {
  return (
    <LexicalComposer
      initialConfig={{
        namespace: 'journal',
        nodes: chapterNodes,
        editable: false,
        editorState: JSON.stringify(content),
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
            ...theme.typography.body1
          },
          ...chapterContentStyles(theme)
        })}
      >
        <RichTextPlugin
          contentEditable={<ContentEditable className="journal-editor-input" />}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <ListPlugin />
        <LinkPlugin validateUrl={validateUrl} />
        <ClickableLinkPlugin newTab />
      </Box>
    </LexicalComposer>
  );
}

export default memo(ChapterContentReader);
