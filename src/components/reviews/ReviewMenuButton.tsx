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
import { useRouter } from 'next/router';
import { enqueueSnackbar, useSnackbar } from 'notistack';
import {
  memo,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState
} from 'react';
import { Profile, Review } from '../../../types';
import AuthContext from '../../context/AuthContext';
import useDictionary from '../../hooks/useDictionary';

type Props = {
  review: Review;
  currentProfile?: Profile | null;
  onEditClick?: (review: Review) => void;
  onDeleteClick?: (review: Review) => void;
  onReportClick?: (review: Review) => void;
  hideDetail?: boolean;
};

export default memo(function ReviewMenuButton({
  review,
  currentProfile,
  onEditClick,
  onDeleteClick,
  onReportClick,
  hideDetail
}: Props) {
  const { currentUser, setSignInRequired } = useContext(AuthContext);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const router = useRouter();
  const dictionary = useDictionary();

  const isAuthor = useMemo(() => {
    return currentProfile?.id === review.author.id;
  }, [review, currentProfile]);

  const basePath =
    router.locale === router.defaultLocale ? '' : `/${router.locale}`;
  const url = `${process.env.NEXT_PUBLIC_ENDPOINT}${basePath}/maps/${review.map.id}/reports/${review.id}`;

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

    onReportClick(review);
  }, [currentUser, review, onReportClick, setSignInRequired]);

  const handleEditClick = useCallback(() => {
    setAnchorEl(null);

    onEditClick(review);
  }, [review, onEditClick]);

  const handleDeleteClick = useCallback(() => {
    setAnchorEl(null);

    onDeleteClick(review);
  }, [review, onDeleteClick]);

  const handleDetailClick = useCallback(() => {
    setAnchorEl(null);

    router.push(`/maps/${review.map.id}/reports/${review.id}`);
  }, [review]);

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
        {!isAuthor && currentProfile && (
          <MenuItem onClick={handleReportClick}>
            <ListItemIcon>
              <ReportProblem fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={dictionary.report} />
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
