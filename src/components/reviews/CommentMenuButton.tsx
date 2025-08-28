import { Delete, MoreVert, ReportProblem } from '@mui/icons-material';
import {
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem
} from '@mui/material';
import {
  memo,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState
} from 'react';
import type { Comment, Profile } from '../../../types';
import AuthContext from '../../context/AuthContext';
import useDictionary from '../../hooks/useDictionary';

type Props = {
  comment: Comment;
  onReportClick: (comment: Comment) => void;
  currentProfile?: Profile | null;
  onDeleteClick?: (comment: Comment) => void;
};

export default memo(function CommentMenuButton({
  comment,
  onReportClick,
  currentProfile,
  onDeleteClick
}: Props) {
  const { currentUser, setSignInRequired } = useContext(AuthContext);

  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const dictionary = useDictionary();

  const isAuthor = useMemo(() => {
    return currentProfile?.id === comment.author.id;
  }, [comment, currentProfile]);

  const handleReportClick = useCallback(() => {
    setAnchorEl(null);

    if (!currentUser) {
      setSignInRequired(true);
      return;
    }

    onReportClick(comment);
  }, [currentUser, comment, onReportClick, setSignInRequired]);

  const handleDeleteClick = useCallback(() => {
    setAnchorEl(null);

    onDeleteClick(comment);
  }, [comment, onDeleteClick]);

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
        {!isAuthor && (
          <MenuItem onClick={handleReportClick}>
            <ListItemIcon>
              <ReportProblem />
            </ListItemIcon>
            <ListItemText primary={dictionary.report} />
          </MenuItem>
        )}
        {onDeleteClick && isAuthor && (
          <MenuItem onClick={handleDeleteClick}>
            <ListItemIcon>
              <Delete color="error" />
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
