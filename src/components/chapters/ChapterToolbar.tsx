'use client';

import { $isLinkNode, formatUrl, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import {
  Add,
  FormatBold,
  FormatItalic,
  FormatStrikethrough,
  FormatUnderlined,
  Link as LinkIcon,
  Redo,
  Transform,
  Undo
} from '@mui/icons-material';
import {
  AppBar,
  Box,
  Button,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Popover,
  TextField,
  Toolbar
} from '@mui/material';
import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  $setSelection,
  type BaseSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND
} from 'lexical';
import {
  type MouseEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState
} from 'react';
import useDictionary from '../../hooks/useDictionary';
import { type BlockAction, useBlockActions } from './chapterBlockActions';

function ToolButton({
  label,
  active,
  onClick,
  disabled = false,
  children
}: {
  label: string;
  active: boolean;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <IconButton
      aria-label={label}
      aria-pressed={active}
      color={active ? 'primary' : 'default'}
      disabled={disabled}
      // Keep the editor focused so pressing a button neither blurs the editor
      // (which hides this toolbar) nor drops the current selection.
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {children}
    </IconButton>
  );
}

export default function ChapterToolbar() {
  const [editor] = useLexicalComposerContext();
  const dictionary = useDictionary();
  const blockActions = useBlockActions();

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

  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const [blockMenuAnchor, setBlockMenuAnchor] = useState<HTMLElement | null>(
    null
  );
  const [convertAnchor, setConvertAnchor] = useState<HTMLElement | null>(null);
  const [linkAnchor, setLinkAnchor] = useState<HTMLElement | null>(null);
  const [linkValue, setLinkValue] = useState('');
  const savedSelectionRef = useRef<BaseSelection | null>(null);

  useEffect(() => {
    const updateToolbar = () => {
      const selection = $getSelection();

      if (!$isRangeSelection(selection)) {
        return;
      }

      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));

      const anchorNode = selection.anchor.getNode();
      setIsLink($isLinkNode(anchorNode) || $isLinkNode(anchorNode.getParent()));
    };

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
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [editor]);

  const captureSelection = () => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      savedSelectionRef.current = $isRangeSelection(selection)
        ? selection.clone()
        : null;
    });
  };

  const restoreSelection = () => {
    editor.update(() => {
      if (savedSelectionRef.current) {
        $setSelection(savedSelectionRef.current.clone());
      }
    });
  };

  const openBlockMenu = (event: MouseEvent<HTMLButtonElement>) => {
    captureSelection();
    setBlockMenuAnchor(event.currentTarget);
  };

  const insertBlock = (action: BlockAction) => {
    setBlockMenuAnchor(null);

    editor.update(() => {
      if (savedSelectionRef.current) {
        $setSelection(savedSelectionRef.current.clone());
      }

      const selection = $getSelection();
      const anchorNode = $isRangeSelection(selection)
        ? selection.anchor.getNode()
        : null;
      const block =
        anchorNode && anchorNode.getKey() !== 'root'
          ? anchorNode.getTopLevelElementOrThrow()
          : null;

      const paragraph = $createParagraphNode();

      if (block) {
        block.insertAfter(paragraph);
      } else {
        $getRoot().append(paragraph);
      }

      paragraph.select();
    });

    action.apply(editor);
  };

  const openConvertMenu = (event: MouseEvent<HTMLButtonElement>) => {
    captureSelection();
    setConvertAnchor(event.currentTarget);
  };

  const convertBlock = (action: BlockAction) => {
    setConvertAnchor(null);
    restoreSelection();
    action.apply(editor);
  };

  const openLinkEditor = (event: MouseEvent<HTMLButtonElement>) => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      savedSelectionRef.current = $isRangeSelection(selection)
        ? selection.clone()
        : null;

      const anchorNode = $isRangeSelection(selection)
        ? selection.anchor.getNode()
        : null;
      const linkNode = $isLinkNode(anchorNode)
        ? anchorNode
        : $isLinkNode(anchorNode?.getParent())
          ? anchorNode?.getParent()
          : null;

      setLinkValue($isLinkNode(linkNode) ? linkNode.getURL() : '');
    });

    setLinkAnchor(event.currentTarget);
  };

  const applyLink = () => {
    const trimmed = linkValue.trim();
    const url = trimmed ? formatUrl(trimmed) : '';

    restoreSelection();
    editor.dispatchCommand(
      TOGGLE_LINK_COMMAND,
      url ? { url, target: '_blank', rel: 'noopener noreferrer' } : null
    );
    setLinkAnchor(null);
  };

  const removeLink = () => {
    restoreSelection();
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    setLinkAnchor(null);
  };

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
          label={dictionary['insert block']}
          active={Boolean(blockMenuAnchor)}
          onClick={openBlockMenu}
        >
          <Add />
        </ToolButton>
        <ToolButton
          label={dictionary['turn into']}
          active={Boolean(convertAnchor)}
          onClick={openConvertMenu}
        >
          <Transform />
        </ToolButton>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

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
        <ToolButton
          label={dictionary['format underline']}
          active={isUnderline}
          onClick={() =>
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')
          }
        >
          <FormatUnderlined />
        </ToolButton>
        <ToolButton
          label={dictionary['format strikethrough']}
          active={isStrikethrough}
          onClick={() =>
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')
          }
        >
          <FormatStrikethrough />
        </ToolButton>
        <ToolButton
          label={dictionary.link}
          active={isLink}
          onClick={openLinkEditor}
        >
          <LinkIcon />
        </ToolButton>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        <ToolButton
          label={dictionary.undo}
          active={false}
          disabled={!canUndo}
          onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        >
          <Undo />
        </ToolButton>
        <ToolButton
          label={dictionary.redo}
          active={false}
          disabled={!canRedo}
          onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        >
          <Redo />
        </ToolButton>
      </Toolbar>

      <Menu
        anchorEl={blockMenuAnchor}
        open={Boolean(blockMenuAnchor)}
        onClose={() => setBlockMenuAnchor(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        {blockActions.map((action) => (
          <MenuItem key={action.key} onClick={() => insertBlock(action)}>
            <ListItemIcon>{action.icon}</ListItemIcon>
            <ListItemText primary={action.label} />
          </MenuItem>
        ))}
      </Menu>

      <Menu
        anchorEl={convertAnchor}
        open={Boolean(convertAnchor)}
        onClose={() => setConvertAnchor(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        {blockActions
          .filter((action) => action.key !== 'divider')
          .map((action) => (
            <MenuItem key={action.key} onClick={() => convertBlock(action)}>
              <ListItemIcon>{action.icon}</ListItemIcon>
              <ListItemText primary={action.label} />
            </MenuItem>
          ))}
      </Menu>

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
    </AppBar>
  );
}
