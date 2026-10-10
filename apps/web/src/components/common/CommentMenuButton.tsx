import { Delete, MoreVert, ReportProblem } from '@mui/icons-material';
import {
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem
} from '@mui/material';
import { memo, useRef, useState } from 'react';
import type { Comment, Profile } from '../../../types/index.ts';
import useBlock from '../../hooks/useBlock.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import useMute from '../../hooks/useMute.ts';
import BlockMenuItem from './BlockMenuItem.tsx';
import BlockUserDialog from './BlockUserDialog.tsx';
import MuteMenuItem from './MuteMenuItem.tsx';

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
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);

  const dictionary = useDictionary();
  const { pending: blockPending, block } = useBlock();
  const { pending: mutePending, mute } = useMute();

  const isAuthor = currentProfile?.id === comment.author.id;

  const handleReportClick = () => {
    setAnchorEl(null);

    onReportClick(comment);
  };

  const handleDeleteClick = () => {
    setAnchorEl(null);

    onDeleteClick?.(comment);
  };

  const handleMuteClick = () => {
    setAnchorEl(null);

    mute(comment.author.id);
  };

  const handleBlockClick = () => {
    setAnchorEl(null);

    setBlockDialogOpen(true);
  };

  const handleBlockConfirm = async () => {
    const blocked = await block(comment.author.id);

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
        {currentProfile && !isAuthor && (
          <MuteMenuItem muting={false} onClick={handleMuteClick} />
        )}
        {currentProfile && !isAuthor && (
          <BlockMenuItem blocking={false} onClick={handleBlockClick} />
        )}
        {!isAuthor && (
          <MenuItem onClick={handleReportClick}>
            <ListItemIcon>
              <ReportProblem />
            </ListItemIcon>
            <ListItemText primary={dictionary['report content']} />
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

      <BlockUserDialog
        open={blockDialogOpen}
        loading={blockPending}
        onClose={() => setBlockDialogOpen(false)}
        onConfirm={handleBlockConfirm}
      />
    </>
  );
});
