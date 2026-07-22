import { $isLinkNode, TOGGLE_LINK_COMMAND, formatUrl } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import {
  FormatBold,
  FormatItalic,
  FormatStrikethrough,
  FormatUnderlined,
  Link as LinkIcon
} from '@mui/icons-material';
import {
  Box,
  Button,
  Divider,
  IconButton,
  Paper,
  Popover,
  Popper,
  TextField
} from '@mui/material';
import {
  $getSelection,
  $isRangeSelection,
  $setSelection,
  type BaseSelection,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND
} from 'lexical';
import {
  type MouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import useDictionary from '../../hooks/useDictionary';

function FormatButton({
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
      size="small"
      aria-label={label}
      aria-pressed={active}
      color={active ? 'primary' : 'default'}
      // Keep the editor selection when pressing a button instead of blurring it.
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {children}
    </IconButton>
  );
}

export default function ChapterFloatingToolbar() {
  const [editor] = useLexicalComposerContext();
  const dictionary = useDictionary();

  const [visible, setVisible] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isLink, setIsLink] = useState(false);

  const [linkAnchor, setLinkAnchor] = useState<HTMLElement | null>(null);
  const [linkValue, setLinkValue] = useState('');
  const savedSelectionRef = useRef<BaseSelection | null>(null);

  // Falls back to the last known selection rect so the toolbar stays put while
  // the link editor holds focus and the text selection is cleared.
  const lastRectRef = useRef<DOMRect | null>(null);
  const linkOpenRef = useRef(false);

  useEffect(() => {
    linkOpenRef.current = Boolean(linkAnchor);
  }, [linkAnchor]);

  const update = useCallback(() => {
    const selection = $getSelection();

    if (
      !$isRangeSelection(selection) ||
      selection.isCollapsed() ||
      !selection.getTextContent()
    ) {
      setVisible(false);
      return;
    }

    setIsBold(selection.hasFormat('bold'));
    setIsItalic(selection.hasFormat('italic'));
    setIsUnderline(selection.hasFormat('underline'));
    setIsStrikethrough(selection.hasFormat('strikethrough'));

    const node = selection.anchor.getNode();
    setIsLink($isLinkNode(node) || $isLinkNode(node.getParent()));

    const domSelection = window.getSelection();

    if (domSelection && domSelection.rangeCount > 0) {
      const rect = domSelection.getRangeAt(0).getBoundingClientRect();

      if (rect.width || rect.height) {
        lastRectRef.current = rect;
      }
    }

    setVisible(true);
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(update);
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          editor.getEditorState().read(update);
          return false;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [editor, update]);

  const anchorEl = useMemo(
    () => ({
      getBoundingClientRect: () => {
        if (!linkOpenRef.current) {
          const domSelection = window.getSelection();

          if (domSelection && domSelection.rangeCount > 0) {
            const rect = domSelection.getRangeAt(0).getBoundingClientRect();

            if (rect.width || rect.height) {
              return rect;
            }
          }
        }

        return lastRectRef.current ?? new DOMRect();
      }
    }),
    []
  );

  const openLinkEditor = useCallback(
    (anchor: HTMLElement) => {
      let current = '';

      editor.getEditorState().read(() => {
        const selection = $getSelection();

        if ($isRangeSelection(selection)) {
          savedSelectionRef.current = selection.clone();

          const node = selection.anchor.getNode();
          const linkNode = $isLinkNode(node)
            ? node
            : $isLinkNode(node.getParent())
              ? node.getParent()
              : null;

          if ($isLinkNode(linkNode)) {
            current = linkNode.getURL();
          }
        }
      });

      setLinkValue(current);
      setLinkAnchor(anchor);
    },
    [editor]
  );

  const restoreSelection = useCallback(() => {
    editor.update(() => {
      if (savedSelectionRef.current) {
        $setSelection(savedSelectionRef.current.clone());
      }
    });
  }, [editor]);

  const applyLink = useCallback(() => {
    const trimmed = linkValue.trim();
    const url = trimmed ? formatUrl(trimmed) : '';

    restoreSelection();
    editor.dispatchCommand(
      TOGGLE_LINK_COMMAND,
      url ? { url, target: '_blank', rel: 'noopener noreferrer' } : null
    );
    setLinkAnchor(null);
  }, [editor, linkValue, restoreSelection]);

  const removeLink = useCallback(() => {
    restoreSelection();
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    setLinkAnchor(null);
  }, [editor, restoreSelection]);

  return (
    <>
      <Popper
        open={visible || Boolean(linkAnchor)}
        anchorEl={anchorEl}
        placement="top"
        modifiers={[{ name: 'offset', options: { offset: [0, 8] } }]}
        sx={{ zIndex: (theme) => theme.zIndex.tooltip }}
      >
        <Paper
          elevation={3}
          sx={{ display: 'flex', alignItems: 'center', gap: 0.25, p: 0.5 }}
        >
          <FormatButton
            label={dictionary['format bold']}
            active={isBold}
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
          >
            <FormatBold fontSize="small" />
          </FormatButton>
          <FormatButton
            label={dictionary['format italic']}
            active={isItalic}
            onClick={() =>
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')
            }
          >
            <FormatItalic fontSize="small" />
          </FormatButton>
          <FormatButton
            label={dictionary['format underline']}
            active={isUnderline}
            onClick={() =>
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')
            }
          >
            <FormatUnderlined fontSize="small" />
          </FormatButton>
          <FormatButton
            label={dictionary['format strikethrough']}
            active={isStrikethrough}
            onClick={() =>
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')
            }
          >
            <FormatStrikethrough fontSize="small" />
          </FormatButton>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.25 }} />

          <FormatButton
            label={dictionary.link}
            active={isLink}
            onClick={(event) => openLinkEditor(event.currentTarget)}
          >
            <LinkIcon fontSize="small" />
          </FormatButton>
        </Paper>
      </Popper>

      <Popover
        open={Boolean(linkAnchor)}
        anchorEl={linkAnchor}
        onClose={() => setLinkAnchor(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Box
          component="form"
          onSubmit={(event) => {
            event.preventDefault();
            applyLink();
          }}
          sx={{ display: 'flex', gap: 1, alignItems: 'center', p: 1.5 }}
        >
          <TextField
            autoFocus
            size="small"
            type="url"
            placeholder={dictionary['link placeholder']}
            value={linkValue}
            onChange={(event) => setLinkValue(event.target.value)}
            sx={{ minWidth: 220 }}
          />
          {isLink && (
            <Button color="inherit" onClick={removeLink}>
              {dictionary.remove}
            </Button>
          )}
          <Button
            type="submit"
            variant="contained"
            disabled={!linkValue.trim()}
          >
            {dictionary.apply}
          </Button>
        </Box>
      </Popover>
    </>
  );
}
