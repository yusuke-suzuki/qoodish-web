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
import { memo, useContext, useState } from 'react';
import type { Comment } from '../../../types/index.ts';
import ProfileContext from '../../context/ProfileContext.ts';
import useLocalePath from '../../hooks/useLocalePath.ts';
import AuthorAvatar from '../common/AuthorAvatar.tsx';
import IssueDialog from '../common/IssueDialog.tsx';
import CommentMenuButton from './CommentMenuButton.tsx';
import DeleteCommentDialog from './DeleteCommentDialog.tsx';

type Props = {
  comments: Comment[];
  onDeleted: () => void;
};

const ReviewComments = ({ comments, onDeleted }: Props) => {
  const { lang } = useParams<{ lang: string }>();
  const localePath = useLocalePath();

  const profile = useContext(ProfileContext);

  const [currentComment, setCurrentComment] = useState<Comment | null>(null);
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDeleteClick = (comment: Comment) => {
    setCurrentComment(comment);
    setDeleteDialogOpen(true);
  };

  const handleReportClick = (comment: Comment) => {
    setCurrentComment(comment);
    setIssueDialogOpen(true);
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
