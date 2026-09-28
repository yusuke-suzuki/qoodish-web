import {
  ArrowForward,
  Delete,
  Edit,
  Link as LinkIcon,
  MoreVert,
  ReportProblem
} from '@mui/icons-material';
import {
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem
} from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import { memo, useRef, useState } from 'react';
import type { Pin, Profile } from '../../../types/index.ts';
import useBlock from '../../hooks/useBlock.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import useMute from '../../hooks/useMute.ts';
import { localePath } from '../../utils/locales.ts';
import { SITE_ORIGIN } from '../../utils/metadata.ts';
import BlockMenuItem from '../common/BlockMenuItem.tsx';
import BlockUserDialog from '../common/BlockUserDialog.tsx';
import MuteMenuItem from '../common/MuteMenuItem.tsx';

type Props = {
  pin: Pin | null;
  currentProfile?: Profile | null;
  onEditClick?: (pin: Pin) => void;
  onDeleteClick?: (pin: Pin) => void;
  onReportClick: (pin: Pin) => void;
  onMuted?: (authorId: number) => void;
  onBlocked?: (authorId: number) => void;
  hideDetail?: boolean;
};

export default memo(function PinMenuButton({
  pin,
  currentProfile,
  onEditClick,
  onDeleteClick,
  onReportClick,
  onMuted,
  onBlocked,
  hideDetail
}: Props) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);

  const { push } = useRouter();
  const { lang } = useParams<{ lang: string }>();
  const dictionary = useDictionary();
  const { pending: blockPending, block, unblock } = useBlock();
  const { pending: mutePending, mute, unmute } = useMute();

  const isAuthor = currentProfile?.id === pin?.author.id;

  const pinPath = `/pins/${pin?.id}`;
  const url = `${SITE_ORIGIN}${localePath(lang, pinPath)}`;

  const handleCopyClick = async () => {
    if (!url) {
      return;
    }

    setAnchorEl(null);

    await navigator.clipboard.writeText(url);

    enqueueSnackbar(dictionary.copied);
  };

  const handleReportClick = () => {
    setAnchorEl(null);

    if (pin) {
      onReportClick(pin);
    }
  };

  const handleEditClick = () => {
    setAnchorEl(null);

    if (pin) {
      onEditClick?.(pin);
    }
  };

  const handleDeleteClick = () => {
    setAnchorEl(null);

    if (pin) {
      onDeleteClick?.(pin);
    }
  };

  const handleDetailClick = () => {
    setAnchorEl(null);

    push(localePath(lang, pinPath));
  };

  const handleMuteClick = async () => {
    setAnchorEl(null);

    if (!pin) {
      return;
    }

    if (pin.author.muting) {
      unmute(pin.author.id);
      return;
    }

    const muted = await mute(pin.author.id);

    if (!muted) {
      return;
    }

    onMuted?.(pin.author.id);
  };

  const handleBlockClick = () => {
    setAnchorEl(null);

    if (!pin) {
      return;
    }

    if (pin.author.blocking) {
      unblock(pin.author.id);
    } else {
      setBlockDialogOpen(true);
    }
  };

  const handleBlockConfirm = async () => {
    if (!pin) {
      return;
    }

    const blocked = await block(pin.author.id);

    if (!blocked) {
      return;
    }

    setBlockDialogOpen(false);
    onBlocked?.(pin.author.id);
  };

  return (
    <>
      <IconButton
        ref={buttonRef}
        onClick={() => setAnchorEl(buttonRef.current)}
        disabled={blockPending || mutePending}
        title={dictionary.more}
        aria-label={dictionary.more}
      >
        <MoreVert />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={handleCopyClick}>
          <ListItemIcon>
            <LinkIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={dictionary['copy link']} />
        </MenuItem>
        {hideDetail ? null : (
          <MenuItem onClick={handleDetailClick}>
            <ListItemIcon>
              <ArrowForward fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={dictionary.detail} />
          </MenuItem>
        )}
        {currentProfile && pin && !isAuthor && (
          <MuteMenuItem
            muting={Boolean(pin.author.muting)}
            onClick={handleMuteClick}
          />
        )}
        {currentProfile && pin && !isAuthor && (
          <BlockMenuItem
            blocking={Boolean(pin.author.blocking)}
            onClick={handleBlockClick}
          />
        )}
        {!isAuthor && (
          <MenuItem onClick={handleReportClick}>
            <ListItemIcon>
              <ReportProblem fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={dictionary['report content']} />
          </MenuItem>
        )}
        {isAuthor && <Divider />}
        {onEditClick && isAuthor && (
          <MenuItem onClick={handleEditClick}>
            <ListItemIcon>
              <Edit fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={dictionary.edit} />
          </MenuItem>
        )}
        {onDeleteClick && isAuthor && (
          <MenuItem onClick={handleDeleteClick}>
            <ListItemIcon>
              <Delete color="error" fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={dictionary.delete}
              slotProps={{
                primary: {
                  color: 'error'
                }
              }}
            />
          </MenuItem>
        )}
      </Menu>

      <BlockUserDialog
        open={blockDialogOpen}
        loading={blockPending}
        onClose={() => setBlockDialogOpen(false)}
        onConfirm={handleBlockConfirm}
      />
    </>
  );
});
