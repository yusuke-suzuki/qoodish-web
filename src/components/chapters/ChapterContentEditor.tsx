'use client';

import { AutoLinkPlugin } from '@lexical/react/LexicalAutoLinkPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { EditorRefPlugin } from '@lexical/react/LexicalEditorRefPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import type {
  EditorState,
  LexicalEditor,
  SerializedEditorState
} from 'lexical';
import { type RefObject, memo, useCallback } from 'react';
import ChapterFloatingToolbar from './ChapterFloatingToolbar';
import ChapterSlashMenu from './ChapterSlashMenu';
import ChapterToolbar from './ChapterToolbar';
import EmptyBlockPlaceholderPlugin from './EmptyBlockPlaceholderPlugin';
import {
  chapterAutoLinkMatchers,
  chapterContentStyles,
  chapterMarkdownTransformers,
  chapterNodes,
  chapterTheme,
  validateUrl
} from './chapterEditorConfig';

type Props = {
  initialContent: SerializedEditorState;
  placeholder: string;
  onChange: (content: SerializedEditorState) => void;
  editorRef?: RefObject<LexicalEditor | null>;
};

function ChapterContentEditor({
  initialContent,
  placeholder,
  onChange,
  editorRef
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'), {
    noSsr: true
  });

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
        editable: true,
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
              placeholder={null}
            />
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <ListPlugin />
        <LinkPlugin validateUrl={validateUrl} />
        <HistoryPlugin />
        <MarkdownShortcutPlugin transformers={chapterMarkdownTransformers} />
        <TabIndentationPlugin />
        <AutoLinkPlugin matchers={chapterAutoLinkMatchers} />
        <EmptyBlockPlaceholderPlugin text={placeholder} />
        <ChapterSlashMenu />
        <OnChangePlugin ignoreSelectionChange onChange={handleChange} />
        {editorRef && <EditorRefPlugin editorRef={editorRef} />}
      </Box>

      {isMobile ? <ChapterToolbar /> : <ChapterFloatingToolbar />}
    </LexicalComposer>
  );
}

export default memo(ChapterContentEditor);
