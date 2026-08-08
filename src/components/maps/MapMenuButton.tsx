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
import {
  memo,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState
} from 'react';
import type { AppMap, Profile } from '../../../types';
import AuthContext from '../../context/AuthContext';
import useDictionary from '../../hooks/useDictionary';
import { localePath } from '../../utils/locales';
import { SITE_ORIGIN } from '../../utils/metadata';
import CoauthorInviteDialog from './CoauthorInviteDialog';

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

  const isAuthor = useMemo(() => {
    return currentProfile?.id === map?.author.id;
  }, [map, currentProfile]);

  const url = `${SITE_ORIGIN}${localePath(lang, `/maps/${map?.id}`)}`;

  const handleCopyClick = useCallback(async () => {
    if (!url) {
      return;
    }

    setAnchorEl(null);

    await navigator.clipboard.writeText(url);

    enqueueSnackbar(dictionary.copied);
  }, [url, dictionary]);

  const handleReportClick = useCallback(() => {
    setAnchorEl(null);

    if (!authenticated) {
      setSignInRequired(true);
      return;
    }

    onReportClick();
  }, [authenticated, setSignInRequired, onReportClick]);

  const handleEditClick = useCallback(() => {
    setAnchorEl(null);

    onEditClick();
  }, [onEditClick]);

  const handleDeleteClick = useCallback(() => {
    setAnchorEl(null);

    onDeleteClick();
  }, [onDeleteClick]);

  const handleInviteClick = useCallback(() => {
    setAnchorEl(null);

    setInviteDialogOpen(true);
  }, []);

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
