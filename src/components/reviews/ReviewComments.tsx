import {
  Box,
  Link as MuiLink,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  Typography
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { enUS, ja } from 'date-fns/locale';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { memo, useCallback, useContext, useState } from 'react';
import { Comment } from '../../../types';
import AuthContext from '../../context/AuthContext';
import { useProfile } from '../../hooks/useProfile';
import AuthorAvatar from '../common/AuthorAvatar';
import IssueDialog from '../common/IssueDialog';
import CommentMenuButton from './CommentMenuButton';
import DeleteCommentDialog from './DeleteCommentDialog';

type Props = {
  comments: Comment[];
  onDeleted: () => void;
};

const ReviewComments = ({ comments, onDeleted }: Props) => {
  const router = useRouter();

  const { currentUser } = useContext(AuthContext);
  const { profile } = useProfile(currentUser?.uid);

  const [currentComment, setCurrentComment] = useState<Comment | null>(null);
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDeleteClick = useCallback((comment: Comment) => {
    setCurrentComment(comment);
    setDeleteDialogOpen(true);
  }, []);

  const handleReportClick = useCallback((comment: Comment) => {
    setCurrentComment(comment);
    setIssueDialogOpen(true);
  }, []);

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
                    href={`/users/${comment.author.id}`}
                    title={comment.author.name}
                  >
                    {comment.author.name}
                  </MuiLink>

                  <Typography variant="body2" color="text.secondary">
                    {formatDistanceToNow(new Date(comment.created_at), {
                      addSuffix: true,
                      locale: router.locale === 'ja' ? ja : enUS
                    })}
                  </Typography>
                </Box>
              }
              secondary={comment.body}
            />
            <ListItemSecondaryAction>
              <CommentMenuButton
                comment={comment}
                onReportClick={handleReportClick}
                onDeleteClick={handleDeleteClick}
                currentProfile={profile}
              />
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <DeleteCommentDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        comment={currentComment}
        onDeleted={onDeleted}
      />

      <IssueDialog
        open={issueDialogOpen}
        onClose={() => setIssueDialogOpen(false)}
        contentType="comment"
        contentId={currentComment ? currentComment.id : null}
      />
    </>
  );
};

export default memo(ReviewComments);
