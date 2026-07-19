'use client';

import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListNode,
  REMOVE_LIST_COMMAND
} from '@lexical/list';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  $isQuoteNode,
  type HeadingTagType
} from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import { $getNearestNodeOfType, mergeRegister } from '@lexical/utils';
import {
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  Mood
} from '@mui/icons-material';
import {
  AppBar,
  Divider,
  IconButton,
  Toolbar,
  Typography
} from '@mui/material';
import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND
} from 'lexical';
import {
  type MouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useState
} from 'react';
import useDictionary from '../../hooks/useDictionary';
import EmojiPicker from './EmojiPicker';

type BlockType = 'paragraph' | 'h2' | 'h3' | 'quote' | 'ul' | 'ol';

function ToolButton({
  label,
  active,
  onClick,
  children
}: {
  label: string;
  active: boolean;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  children: ReactNode;
}) {
  return (
    <IconButton
      aria-label={label}
      aria-pressed={active}
      color={active ? 'primary' : 'default'}
      onClick={onClick}
    >
      {children}
    </IconButton>
  );
}

export default function ChapterToolbar() {
  const [editor] = useLexicalComposerContext();
  const dictionary = useDictionary();

  const [keyboardOffset, setKeyboardOffset] = useState(0);

  useEffect(() => {
    const viewport = window.visualViewport;

    if (!viewport) {
      return;
    }

    const update = () => {
      setKeyboardOffset(
        Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)
      );
    };

    update();
    viewport.addEventListener('resize', update);
    viewport.addEventListener('scroll', update);

    return () => {
      viewport.removeEventListener('resize', update);
      viewport.removeEventListener('scroll', update);
    };
  }, []);

  const [blockType, setBlockType] = useState<BlockType>('paragraph');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);

  const [emojiAnchor, setEmojiAnchor] = useState<HTMLElement | null>(null);

  const handleEmojiSelect = useCallback(
    (emoji: string) => {
      setEmojiAnchor(null);

      editor.update(() => {
        const selection = $getSelection();

        if ($isRangeSelection(selection)) {
          selection.insertText(emoji);
          return;
        }

        $getRoot().selectEnd().insertText(emoji);
      });
    },
    [editor]
  );

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();

    if (!$isRangeSelection(selection)) {
      return;
    }

    setIsBold(selection.hasFormat('bold'));
    setIsItalic(selection.hasFormat('italic'));

    const anchorNode = selection.anchor.getNode();
    const element =
      anchorNode.getKey() === 'root'
        ? anchorNode
        : anchorNode.getTopLevelElementOrThrow();

    if ($isListNode(element)) {
      const listNode = $getNearestNodeOfType(anchorNode, ListNode) ?? element;
      setBlockType(listNode.getListType() === 'number' ? 'ol' : 'ul');
    } else if ($isHeadingNode(element)) {
      const tag = element.getTag();
      setBlockType(tag === 'h3' ? 'h3' : 'h2');
    } else if ($isQuoteNode(element)) {
      setBlockType('quote');
    } else {
      setBlockType('paragraph');
    }
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(updateToolbar);
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar();
          return false;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [editor, updateToolbar]);

  const formatHeading = useCallback(
    (tag: HeadingTagType) => {
      editor.update(() => {
        const selection = $getSelection();

        if (!$isRangeSelection(selection)) {
          return;
        }

        $setBlocksType(selection, () =>
          blockType === tag ? $createParagraphNode() : $createHeadingNode(tag)
        );
      });
    },
    [editor, blockType]
  );

  const formatQuote = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();

      if (!$isRangeSelection(selection)) {
        return;
      }

      $setBlocksType(selection, () =>
        blockType === 'quote' ? $createParagraphNode() : $createQuoteNode()
      );
    });
  }, [editor, blockType]);

  const toggleBulletList = useCallback(() => {
    editor.dispatchCommand(
      blockType === 'ul' ? REMOVE_LIST_COMMAND : INSERT_UNORDERED_LIST_COMMAND,
      undefined
    );
  }, [editor, blockType]);

  const toggleNumberedList = useCallback(() => {
    editor.dispatchCommand(
      blockType === 'ol' ? REMOVE_LIST_COMMAND : INSERT_ORDERED_LIST_COMMAND,
      undefined
    );
  }, [editor, blockType]);

  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={0}
      sx={{
        top: 'auto',
        bottom: keyboardOffset,
        borderTop: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Toolbar sx={{ gap: 0.5, overflowX: 'auto' }}>
        <ToolButton
          label={dictionary['format bold']}
          active={isBold}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
        >
          <FormatBold />
        </ToolButton>
        <ToolButton
          label={dictionary['format italic']}
          active={isItalic}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
        >
          <FormatItalic />
        </ToolButton>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        <ToolButton
          label={dictionary['heading 2']}
          active={blockType === 'h2'}
          onClick={() => formatHeading('h2')}
        >
          <Typography variant="button" component="span" lineHeight={1}>
            H2
          </Typography>
        </ToolButton>
        <ToolButton
          label={dictionary['heading 3']}
          active={blockType === 'h3'}
          onClick={() => formatHeading('h3')}
        >
          <Typography variant="button" component="span" lineHeight={1}>
            H3
          </Typography>
        </ToolButton>
        <ToolButton
          label={dictionary.quote}
          active={blockType === 'quote'}
          onClick={formatQuote}
        >
          <FormatQuote />
        </ToolButton>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        <ToolButton
          label={dictionary['bulleted list']}
          active={blockType === 'ul'}
          onClick={toggleBulletList}
        >
          <FormatListBulleted />
        </ToolButton>
        <ToolButton
          label={dictionary['numbered list']}
          active={blockType === 'ol'}
          onClick={toggleNumberedList}
        >
          <FormatListNumbered />
        </ToolButton>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        <ToolButton
          label={dictionary['insert emoji']}
          active={false}
          onClick={(event) => setEmojiAnchor(event.currentTarget)}
        >
          <Mood />
        </ToolButton>

        <EmojiPicker
          anchorEl={emojiAnchor}
          onClose={() => setEmojiAnchor(null)}
          onSelect={handleEmojiSelect}
        />
      </Toolbar>
    </AppBar>
  );
}
