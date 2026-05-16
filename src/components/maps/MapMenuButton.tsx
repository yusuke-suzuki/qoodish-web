import {
  Delete,
  Edit,
  Link,
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

  const { lang } = useParams<{ lang: string }>();
  const dictionary = useDictionary();

  const isAuthor = useMemo(() => {
    return currentProfile?.id === map?.owner.id;
  }, [map, currentProfile]);

  const url = `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}/${lang}/maps/${map?.id}`;

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
    </>
  );
});
