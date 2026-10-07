import type { SerializedEditorState } from 'lexical';
import { createElement, type ReactNode } from 'react';
import ChapterContentFrame from './ChapterContentFrame.tsx';
import ChapterContentImage from './ChapterContentImage.tsx';
import { type ChapterView, chapterContentTree } from './chapterContentTree.ts';

type Props = {
  content: SerializedEditorState;
};

function renderView(view: ChapterView, key: number): ReactNode {
  switch (view.kind) {
    case 'text':
      return view.text;
    case 'image':
      return <ChapterContentImage key={key} src={view.src} />;
    case 'element':
      return createElement(
        view.tag,
        { key, ...view.props },
        ...view.children.map(renderView)
      );
  }
}

export default function ChapterContent({ content }: Props) {
  return (
    <ChapterContentFrame>
      {chapterContentTree(content).map(renderView)}
    </ChapterContentFrame>
  );
}
