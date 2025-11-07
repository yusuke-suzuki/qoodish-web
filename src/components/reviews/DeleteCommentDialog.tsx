import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { memo, useCallback, useContext, useState } from 'react';
import type { Comment } from '../../../types';
import AuthContext from '../../context/AuthContext';
import useDictionary from '../../hooks/useDictionary';

type Props = {
  comment: Comment | null;
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
};

const DeleteCommentDialog = ({ comment, open, onClose, onDeleted }: Props) => {
  const { currentUser } = useContext(AuthContext);
  const dictionary = useDictionary();

  const [loading, setLoading] = useState(false);

  const handleDeleteButtonClick = useCallback(async () => {
    setLoading(true);

    const token = await currentUser.getIdToken();

    const headers = new Headers({
      Accept: 'application/json',
      'Accept-Language': window.navigator.language,
      'Content-Type': 'application/json; charset=UTF-8',
      Authorization: `Bearer ${token}`
    });

    const request = new Request(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/reviews/${comment?.review_id}/comments/${comment?.id}`,
      {
        method: 'DELETE',
        headers: headers
      }
    );

    try {
      const res = await fetch(request);

      if (res.ok) {
        enqueueSnackbar(dictionary['delete comment success'], {
          variant: 'success'
        });

        onClose();
        onDeleted();
      } else {
        const body = await res.json();
        enqueueSnackbar(body.detail, { variant: 'error' });
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [currentUser, comment, onClose, onDeleted, dictionary]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{dictionary['delete comment']}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {dictionary['sure to delete comment']}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading} color="inherit">
          {dictionary.cancel}
        </Button>
        <Button
          onClick={handleDeleteButtonClick}
          color="error"
          loading={loading}
        >
          {dictionary.delete}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default memo(DeleteCommentDialog);
