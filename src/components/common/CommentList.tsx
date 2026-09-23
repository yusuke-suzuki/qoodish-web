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
import { formatDistanceToNow } from 'date-fns';
import { enUS, ja } from 'date-fns/locale';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { memo, useState } from 'react';
import type { Comment, ContentRef } from '../../../types/index.ts';
import useLocalePath from '../../hooks/useLocalePath.ts';
import AuthorAvatar from './AuthorAvatar.tsx';
import CommentMenuButton from './CommentMenuButton.tsx';
import DeleteCommentDialog from './DeleteCommentDialog.tsx';
import LikeCommentButton from './LikeCommentButton.tsx';
import ProfileBoundary from './ProfileBoundary.tsx';
import ReportDialog from './ReportDialog.tsx';

type Props = {
  subject: ContentRef;
  comments: Comment[];
  onDeleted: () => void;
  onLiked: () => void;
};

const CommentList = ({ subject, comments, onDeleted, onLiked }: Props) => {
  const { lang } = useParams<{ lang: string }>();
  const localePath = useLocalePath();

  const [currentComment, setCurrentComment] = useState<Comment | null>(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDeleteClick = (comment: Comment) => {
    setCurrentComment(comment);
    setDeleteDialogOpen(true);
  };

  const handleReportClick = (comment: Comment) => {
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
                    {formatDistanceToNow(new Date(comment.created_at), {
                      addSuffix: true,
                      locale: lang === 'ja' ? ja : enUS
                    })}
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
