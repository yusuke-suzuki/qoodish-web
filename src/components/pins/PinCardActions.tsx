import { CardActions } from '@mui/material';
import { memo } from 'react';
import type { Pin } from '../../../types/index.ts';
import CommentForm from '../common/CommentForm.tsx';
import LikePinButton from './LikePinButton.tsx';

type Props = {
  pin: Pin;
  onCommentAdded: () => void;
};

const PinCardActions = ({ pin, onCommentAdded }: Props) => (
  <CardActions sx={{ p: 2 }}>
    <CommentForm
      commentable={{ type: 'pin', id: pin.id }}
      onCommentAdded={onCommentAdded}
      collapsedAction={<LikePinButton pin={pin} />}
    />
  </CardActions>
);

export default memo(PinCardActions);
