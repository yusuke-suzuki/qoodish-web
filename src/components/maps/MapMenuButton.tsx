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
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import {
  memo,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState
} from 'react';
import { AppMap, Profile } from '../../../types';
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
  const { currentUser, setSignInRequired } = useContext(AuthContext);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const router = useRouter();
  const dictionary = useDictionary();

  const isAuthor = useMemo(() => {
    return currentProfile?.id === map?.owner.id;
  }, [map, currentProfile]);

  const basePath =
    router.locale === router.defaultLocale ? '' : `/${router.locale}`;
  const url = `${process.env.NEXT_PUBLIC_ENDPOINT}${basePath}/maps/${map?.id}`;

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

    if (!currentUser) {
      setSignInRequired(true);
      return;
    }

    onReportClick();
  }, [currentUser, setSignInRequired, onReportClick]);

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
              primaryTypographyProps={{
                color: 'error'
              }}
            />
          </MenuItem>
        )}
      </Menu>
    </>
  );
});
