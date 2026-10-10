import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  Link as MuiLink,
  Typography
} from '@mui/material';
import Link from 'next/link';
import { memo, useState } from 'react';
import type { CommentItem, ContentRef } from '../../../types/index.ts';
import useLocalePath from '../../hooks/useLocalePath.ts';
import useRelativeTime from '../../hooks/useRelativeTime.ts';
import AuthorAvatar from './AuthorAvatar.tsx';
import CommentMenuButton from './CommentMenuButton.tsx';
import DeleteCommentDialog from './DeleteCommentDialog.tsx';
import LikeCommentButton from './LikeCommentButton.tsx';
import ProfileBoundary from './ProfileBoundary.tsx';
import ReportDialog from './ReportDialog.tsx';

type Props = {
  subject: ContentRef;
  comments: CommentItem[];
  onDeleted: () => void;
  onLiked: () => void;
};

const CommentList = ({ subject, comments, onDeleted, onLiked }: Props) => {
  const localePath = useLocalePath();
  const formatRelativeTime = useRelativeTime();

  const [currentComment, setCurrentComment] = useState<CommentItem | null>(
    null
  );
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDeleteClick = (comment: CommentItem) => {
    setCurrentComment(comment);
    setDeleteDialogOpen(true);
  };

  const handleReportClick = (comment: CommentItem) => {
    setCurrentComment(comment);
    setReportDialogOpen(true);
  };

  return (
    <>
      <List disablePadding>
        {comments.map((comment) => (
          <ListItem key={comment.id} disableGutters disablePadding dense>
            <ListItemAvatar>
              <AuthorAvatar author={comment.author} />
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <MuiLink
                    underline="hover"
                    color="inherit"
                    component={Link}
                    href={localePath(`/users/${comment.author.id}`)}
                    title={comment.author.name}
                  >
                    {comment.author.name}
                  </MuiLink>

                  <Typography variant="body2" color="text.secondary">
                    {formatRelativeTime(comment.created_at)}
                  </Typography>
                </Box>
              }
              secondary={
                <>
                  {comment.body}
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LikeCommentButton
                      subject={subject}
                      comment={comment}
                      onSaved={onLiked}
                    />
                    {comment.likes_count ? comment.likes_count : null}
                  </Box>
                </>
              }
              slotProps={{ secondary: { component: 'div' } }}
            />
            <ListItemSecondaryAction>
              <ProfileBoundary>
                {(profile) => (
                  <CommentMenuButton
                    comment={comment}
                    onReportClick={handleReportClick}
                    onDeleteClick={handleDeleteClick}
                    currentProfile={profile}
                  />
                )}
              </ProfileBoundary>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <DeleteCommentDialog
        subject={subject}
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        comment={currentComment}
        onDeleted={onDeleted}
      />

      <ReportDialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        moderatableType="Comment"
        moderatableId={currentComment ? currentComment.id : null}
      />
    </>
  );
};

export default memo(CommentList);
