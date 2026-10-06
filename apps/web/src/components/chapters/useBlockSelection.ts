'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalEditable } from '@lexical/react/useLexicalEditable';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { mergeRegister } from '@lexical/utils';
import {
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  type NodeKey
} from 'lexical';
import { type RefObject, useEffect } from 'react';

export default function useBlockSelection(
  nodeKey: NodeKey,
  targetRef: RefObject<HTMLElement | null>
) {
  const [editor] = useLexicalComposerContext();
  const isEditable = useLexicalEditable();
  const [isSelected, setSelected, clearSelection] =
    useLexicalNodeSelection(nodeKey);

  useEffect(() => {
    if (!isEditable) {
      return;
    }

    const handleDelete = (event: KeyboardEvent) => {
      const selection = $getSelection();

      if (!isSelected || !$isNodeSelection(selection)) {
        return false;
      }

      event.preventDefault();

      for (const node of selection.getNodes()) {
        node.remove();
      }

      return true;
    };

    return mergeRegister(
      editor.registerCommand<MouseEvent>(
        CLICK_COMMAND,
        (event) => {
          if (event.target !== targetRef.current) {
            return false;
          }

          if (!event.shiftKey) {
            clearSelection();
          }

          setSelected(!isSelected);
          return true;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_DELETE_COMMAND,
        handleDelete,
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_BACKSPACE_COMMAND,
        handleDelete,
        COMMAND_PRIORITY_LOW
      )
    );
  }, [editor, isEditable, isSelected, setSelected, clearSelection, targetRef]);

  const remove = () => {
    editor.update(() => {
      $getNodeByKey(nodeKey)?.remove();
    });
  };

  return { selected: isEditable && isSelected, remove };
}
