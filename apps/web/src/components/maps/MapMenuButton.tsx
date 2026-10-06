import {
  Delete,
  Edit,
  Link,
  MoreVert,
  PersonAdd,
  ReportProblem,
  Sell
} from '@mui/icons-material';
import {
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem
} from '@mui/material';
import { useParams } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import { memo, useRef, useState } from 'react';
import type { AppMap, Profile } from '../../../types/index.ts';
import useBlock from '../../hooks/useBlock.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import useMute from '../../hooks/useMute.ts';
import { localePath } from '../../utils/locales.ts';
import { SITE_ORIGIN } from '../../utils/metadata.ts';
import BlockMenuItem from '../common/BlockMenuItem.tsx';
import BlockUserDialog from '../common/BlockUserDialog.tsx';
import MuteMenuItem from '../common/MuteMenuItem.tsx';
import CoauthorInviteDialog from './CoauthorInviteDialog.tsx';

type Props = {
  map: AppMap | null;
  currentProfile: Profile | null;
  onEditClick: () => void;
  onDeleteClick: () => void;
  onReportClick: () => void;
  onPinPropertiesClick: () => void;
};

export default memo(function MapMenuButton({
  map,
  currentProfile,
  onEditClick,
  onDeleteClick,
  onReportClick,
  onPinPropertiesClick
}: Props) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);

  const { lang } = useParams<{ lang: string }>();
  const dictionary = useDictionary();
  const { pending: blockPending, block, unblock } = useBlock();
  const { pending: mutePending, mute, unmute } = useMute();

  const isAuthor = currentProfile?.id === map?.author.id;

  const url = `${SITE_ORIGIN}${localePath(lang, `/maps/${map?.id}`)}`;

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

    onReportClick();
  };

  const handleEditClick = () => {
    setAnchorEl(null);

    onEditClick();
  };

  const handleDeleteClick = () => {
    setAnchorEl(null);

    onDeleteClick();
  };

  const handlePinPropertiesClick = () => {
    setAnchorEl(null);

    onPinPropertiesClick();
  };

  const handleInviteClick = () => {
    setAnchorEl(null);

    setInviteDialogOpen(true);
  };

  const handleMuteClick = () => {
    setAnchorEl(null);

    if (!map) {
      return;
    }

    if (map.author.muting) {
      unmute(map.author.id);
    } else {
      mute(map.author.id);
    }
  };

  const handleBlockClick = () => {
    setAnchorEl(null);

    if (!map) {
      return;
    }

    if (map.author.blocking) {
      unblock(map.author.id);
    } else {
      setBlockDialogOpen(true);
    }
  };

  const handleBlockConfirm = async () => {
    if (!map) {
      return;
    }

    const blocked = await block(map.author.id);

    if (!blocked) {
      return;
    }

    setBlockDialogOpen(false);
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
            <Link fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={dictionary['copy link']} />
        </MenuItem>

        {currentProfile && map && !isAuthor && (
          <MuteMenuItem
            muting={Boolean(map.author.muting)}
            onClick={handleMuteClick}
          />
        )}

        {currentProfile && map && !isAuthor && (
          <BlockMenuItem
            blocking={Boolean(map.author.blocking)}
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

        {map?.editable && <Divider />}

        {map?.editable && (
          <MenuItem onClick={handlePinPropertiesClick}>
            <ListItemIcon>
              <Sell fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={dictionary['pin properties']} />
          </MenuItem>
        )}

        {isAuthor && (
          <MenuItem onClick={handleInviteClick}>
            <ListItemIcon>
              <PersonAdd fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={dictionary.invite} />
          </MenuItem>
        )}

        {isAuthor && (
          <MenuItem onClick={handleEditClick}>
            <ListItemIcon>
              <Edit fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={dictionary.edit} />
          </MenuItem>
        )}

        {isAuthor && (
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

      <CoauthorInviteDialog
        open={inviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
        map={map}
      />

      <BlockUserDialog
        open={blockDialogOpen}
        loading={blockPending}
        onClose={() => setBlockDialogOpen(false)}
        onConfirm={handleBlockConfirm}
      />
    </>
  );
});
