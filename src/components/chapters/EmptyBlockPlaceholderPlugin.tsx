'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isParagraphNode, $isRangeSelection } from 'lexical';
import { useEffect } from 'react';

const PLACEHOLDER_CLASS = 'journal-block-placeholder';
const PLACEHOLDER_ATTR = 'data-placeholder';

// Shows the hint on the empty paragraph that currently holds the caret, the way
// Notion prompts on the focused block, rather than a single editor-wide message.
export default function EmptyBlockPlaceholderPlugin({
  text
}: { text: string }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    let tagged: HTMLElement | null = null;

    const clear = () => {
      tagged?.removeAttribute(PLACEHOLDER_ATTR);
      tagged?.classList.remove(PLACEHOLDER_CLASS);
      tagged = null;
    };

    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();

        if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
          clear();
          return;
        }

        const anchorNode = selection.anchor.getNode();
        const block =
          anchorNode.getKey() === 'root'
            ? null
            : anchorNode.getTopLevelElementOrThrow();

        if (
          !block ||
          !$isParagraphNode(block) ||
          block.getTextContentSize() > 0
        ) {
          clear();
          return;
        }

        const element = editor.getElementByKey(block.getKey());

        if (element !== tagged) {
          clear();
          tagged = element;
        }

        element?.setAttribute(PLACEHOLDER_ATTR, text);
        element?.classList.add(PLACEHOLDER_CLASS);
      });
    });
  }, [editor, text]);

  return null;
}
