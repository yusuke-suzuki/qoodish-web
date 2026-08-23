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
import { memo, useContext, useRef, useState } from 'react';
import type { Profile, Review } from '../../../types';
import AuthContext from '../../context/AuthContext';
import useDictionary from '../../hooks/useDictionary';
import { localePath } from '../../utils/locales';
import { SITE_ORIGIN } from '../../utils/metadata';

type Props = {
  review: Review | null;
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
  const { authenticated, setSignInRequired } = useContext(AuthContext);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const { push } = useRouter();
  const { lang } = useParams<{ lang: string }>();
  const dictionary = useDictionary();

  const isAuthor = currentProfile?.id === review?.author.id;

  const reviewPath = `/maps/${review?.map.id}/reports/${review?.id}`;
  const url = `${SITE_ORIGIN}${localePath(lang, reviewPath)}`;

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

    onReportClick(review);
  };

  const handleEditClick = () => {
    setAnchorEl(null);

    onEditClick(review);
  };

  const handleDeleteClick = () => {
    setAnchorEl(null);

    onDeleteClick(review);
  };

  const handleDetailClick = () => {
    setAnchorEl(null);

    push(localePath(lang, reviewPath));
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
