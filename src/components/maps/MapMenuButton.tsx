import {
  Delete,
  Edit,
  Link,
  MoreVert,
  PersonAdd,
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
import { useParams } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import { memo, useContext, useRef, useState } from 'react';
import type { AppMap, Profile } from '../../../types/index.ts';
import AuthContext from '../../context/AuthContext.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import { localePath } from '../../utils/locales.ts';
import { SITE_ORIGIN } from '../../utils/metadata.ts';
import CoauthorInviteDialog from './CoauthorInviteDialog.tsx';

type Props = {
  map: AppMap | null;
  currentProfile: Profile | null;
  onEditClick: () => void;
  onDeleteClick: () => void;
  onReportClick: () => void;
};

export default memo(function MapMenuButton({
  map,
  currentProfile,
  onEditClick,
  onDeleteClick,
  onReportClick
}: Props) {
  const { authenticated, setSignInRequired } = useContext(AuthContext);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const { lang } = useParams<{ lang: string }>();
  const dictionary = useDictionary();

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

    if (!authenticated) {
      setSignInRequired(true);
      return;
    }

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

  const handleInviteClick = () => {
    setAnchorEl(null);

    setInviteDialogOpen(true);
  };

  return (
    <>
      <IconButton
        ref={buttonRef}
        onClick={() => setAnchorEl(buttonRef.current)}
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

        {!isAuthor && currentProfile && (
          <MenuItem onClick={handleReportClick}>
            <ListItemIcon>
              <ReportProblem fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={dictionary.report} />
          </MenuItem>
        )}

        {isAuthor && <Divider />}

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
    </>
  );
});
