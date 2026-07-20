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
import {
  $getNearestNodeOfType,
  $insertNodeToNearestRoot,
  mergeRegister
} from '@lexical/utils';
import {
  AddLocationAlt,
  AddPhotoAlternate,
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  Mood
} from '@mui/icons-material';
import {
  AppBar,
  CircularProgress,
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
  type LexicalNode,
  SELECTION_CHANGE_COMMAND
} from 'lexical';
import { enqueueSnackbar } from 'notistack';
import {
  type ChangeEvent,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useState
} from 'react';
import useDictionary from '../../hooks/useDictionary';
import fileToDataUrl from '../../utils/fileToDataUrl';
import uploadImage from '../../utils/uploadImage';
import EmojiPicker from './EmojiPicker';
import { $createImageNode } from './ImageNode';
import { $createStaticMapNode } from './StaticMapNode';
import StaticMapPickerDialog from './StaticMapPickerDialog';

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

export default function ChapterToolbar({
  mapCenter
}: {
  mapCenter: google.maps.LatLngLiteral;
}) {
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

  const imageInputId = useId();
  const [uploadingImage, setUploadingImage] = useState(false);
  const [mapPickerOpen, setMapPickerOpen] = useState(false);

  const insertBlock = useCallback(
    (node: LexicalNode) => {
      editor.update(() => {
        $insertNodeToNearestRoot(node);

        const paragraph = $createParagraphNode();
        node.insertAfter(paragraph);
        paragraph.select();
      });
    },
    [editor]
  );

  const handleImageFilesChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files ?? []);
      event.target.value = '';

      if (files.length < 1) {
        return;
      }

      setUploadingImage(true);

      try {
        for (const file of files) {
          const dataUrl = await fileToDataUrl(file);
          const image = await uploadImage(dataUrl);

          insertBlock(
            $createImageNode({
              image_id: image.id,
              url: image.url,
              hero: image.hero
            })
          );
        }
      } catch {
        enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
      } finally {
        setUploadingImage(false);
      }
    },
    [insertBlock, dictionary]
  );

  const handleMapSelect = useCallback(
    (position: google.maps.LatLngLiteral) => {
      setMapPickerOpen(false);
      insertBlock($createStaticMapNode(position.lat, position.lng));
    },
    [insertBlock]
  );

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

        <input
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          id={imageInputId}
          type="file"
          onChange={handleImageFilesChange}
        />
        <label htmlFor={imageInputId}>
          <IconButton
            component="span"
            aria-label={dictionary['add images']}
            disabled={uploadingImage}
          >
            {uploadingImage ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <AddPhotoAlternate />
            )}
          </IconButton>
        </label>

        <ToolButton
          label={dictionary['insert map']}
          active={false}
          onClick={() => setMapPickerOpen(true)}
        >
          <AddLocationAlt />
        </ToolButton>

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

        <StaticMapPickerDialog
          open={mapPickerOpen}
          defaultCenter={mapCenter}
          onClose={() => setMapPickerOpen(false)}
          onSelect={handleMapSelect}
        />
      </Toolbar>
    </AppBar>
  );
}
