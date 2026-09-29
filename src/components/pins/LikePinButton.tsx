import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { Checkbox, Tooltip } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import {
  type ChangeEvent,
  memo,
  useCallback,
  useContext,
  useState,
  useTransition
} from 'react';
import type { Pin } from '../../../types/index.ts';
import { likePin, unlikePin } from '../../actions/pinLikes.ts';
import AuthContext from '../../context/AuthContext.ts';
import useDictionary from '../../hooks/useDictionary.ts';

type Props = {
  pin: Pin;
  onSaved?: () => void;
};

export default memo(function LikePinButton({ pin, onSaved }: Props) {
  const { authenticated, setSignInRequired } = useContext(AuthContext);
  const dictionary = useDictionary();

  const [checked, setChecked] = useState(pin.liked);
  const [isPending, startTransition] = useTransition();

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (!authenticated) {
        setSignInRequired(true);
        return;
      }

      const next = event.target.checked;
      setChecked(next);

      startTransition(async () => {
        try {
          const result = next ? await likePin(pin.id) : await unlikePin(pin.id);

          if (result.success) {
            const message = next ? 'liked!' : 'unliked';
            enqueueSnackbar(dictionary[message], { variant: 'info' });

            if (onSaved) {
              onSaved();
            }
          } else {
            setChecked(!next);
            enqueueSnackbar(result.error, { variant: 'error' });
          }
        } catch (_error) {
          setChecked(!next);
          enqueueSnackbar(dictionary['an error occurred'], {
            variant: 'error'
          });
        }
      });
    },
    [authenticated, pin, setSignInRequired, dictionary, onSaved]
  );

  return (
    <Tooltip
      title={checked ? dictionary['button unlike'] : dictionary['button like']}
    >
      <Checkbox
        icon={<FavoriteBorder />}
        checkedIcon={<Favorite />}
        checked={checked}
        disabled={isPending}
        onChange={handleChange}
      />
    </Tooltip>
  );
});
