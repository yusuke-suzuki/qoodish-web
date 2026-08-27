import { Delete, MoreVert, ReportProblem } from '@mui/icons-material';
import {
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem
} from '@mui/material';
import { memo, useContext, useRef, useState } from 'react';
import type { Comment, Profile } from '../../../types/index.ts';
import AuthContext from '../../context/AuthContext.ts';
import useDictionary from '../../hooks/useDictionary.ts';

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
  const { authenticated, setSignInRequired } = useContext(AuthContext);

  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const dictionary = useDictionary();

  const isAuthor = currentProfile?.id === comment.author.id;

  const handleReportClick = () => {
    setAnchorEl(null);

    if (!authenticated) {
      setSignInRequired(true);
      return;
    }

    onReportClick(comment);
  };

  const handleDeleteClick = () => {
    setAnchorEl(null);

    onDeleteClick(comment);
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
