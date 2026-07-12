'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey, type LexicalNode, type NodeKey } from 'lexical';
import { useCallback } from 'react';

export default function useChapterNodeActions(nodeKey: NodeKey) {
  const [editor] = useLexicalComposerContext();

  const withNode = useCallback(
    (mutate: (node: LexicalNode) => void) => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);

        if (node) {
          mutate(node);
        }
      });
    },
    [editor, nodeKey]
  );

  const moveUp = useCallback(() => {
    withNode((node) => {
      node.getPreviousSibling()?.insertBefore(node);
    });
  }, [withNode]);

  const moveDown = useCallback(() => {
    withNode((node) => {
      node.getNextSibling()?.insertAfter(node);
    });
  }, [withNode]);

  const remove = useCallback(() => {
    withNode((node) => {
      node.remove();
    });
  }, [withNode]);

  return { moveUp, moveDown, remove };
}
