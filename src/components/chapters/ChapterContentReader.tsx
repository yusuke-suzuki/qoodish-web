'use client';

import { ClickableLinkPlugin } from '@lexical/react/LexicalClickableLinkPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { Alert, Box } from '@mui/material';
import type { SerializedEditorState } from 'lexical';
import { memo } from 'react';
import useDictionary from '../../hooks/useDictionary.ts';
import { isChapterContent } from '../../utils/chapterContentSchema.ts';
import SectionErrorBoundary from '../common/SectionErrorBoundary.tsx';
import {
  chapterContentStyles,
  chapterNodes,
  chapterTheme,
  validateUrl
} from './chapterEditorConfig.ts';

type Props = {
  content: SerializedEditorState;
};

function ChapterContentReader({ content }: Props) {
  const dictionary = useDictionary();

  // A row written before validation, or by hand, must cost the body alone
  // and not the page around it.
  if (!isChapterContent(content)) {
    return (
      <Alert severity="warning">
        {dictionary['chapter content unreadable']}
      </Alert>
    );
  }

  return (
    <SectionErrorBoundary>
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
            contentEditable={
              <ContentEditable className="journal-editor-input" />
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <ListPlugin />
          <LinkPlugin validateUrl={validateUrl} />
          <ClickableLinkPlugin newTab />
        </Box>
      </LexicalComposer>
    </SectionErrorBoundary>
  );
}

export default memo(ChapterContentReader);
