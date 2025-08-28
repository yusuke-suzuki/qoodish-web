import { LoadingButton } from '@mui/lab';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import {
  type ChangeEvent,
  memo,
  useCallback,
  useContext,
  useState
} from 'react';
import AuthContext from '../../context/AuthContext';
import useDictionary from '../../hooks/useDictionary';

type Props = {
  open: boolean;
  onClose: () => void;
  contentId: number | null;
  contentType: string;
};

const IssueDialog = ({ open, onClose, contentId, contentType }: Props) => {
  const { currentUser } = useContext(AuthContext);

  const dictionary = useDictionary();

  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState<string | undefined>(undefined);

  const handleSendButtonClick = useCallback(async () => {
    setLoading(true);

    const params = {
      content_id: contentId,
      content_type: contentType,
      reason_id: Number(reason)
    };

    const token = await currentUser.getIdToken();

    const headers = new Headers({
      Accept: 'application/json',
      'Accept-Language': window.navigator.language,
      'Content-Type': 'application/json; charset=UTF-8',
      Authorization: `Bearer ${token}`
    });

    const request = new Request(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/inappropriate_contents`,
      {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(params)
      }
    );

    try {
      const res = await fetch(request);

      if (res.ok) {
        enqueueSnackbar(dictionary['create issue success'], {
          variant: 'success'
        });

        onClose();
      } else {
        const body = await res.json();
        enqueueSnackbar(body.detail, { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [currentUser, contentId, contentType, reason, dictionary, onClose]);

  const handleReasonChange = useCallback(
    (_event: ChangeEvent<HTMLInputElement>, value: string) => {
      setReason(value);
    },
    []
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{dictionary['report inappropriate content']}</DialogTitle>
      <DialogContent>
        <FormControl required>
          <FormLabel focused>
            {dictionary['report inappropriate content detail']}
          </FormLabel>
          <br />
          <RadioGroup
            aria-label="issueReason"
            name="issueReason"
            value={reason}
            onChange={handleReasonChange}
          >
            <FormControlLabel
              value="0"
              control={<Radio checked={reason === '0'} />}
              label={dictionary['not interested in']}
            />
            <FormControlLabel
              value="1"
              control={<Radio checked={reason === '1'} />}
              label={dictionary.spam}
            />
            <FormControlLabel
              value="2"
              control={<Radio checked={reason === '2'} />}
              label={dictionary.sensitive}
            />
            <FormControlLabel
              value="3"
              control={<Radio checked={reason === '3'} />}
              label={dictionary['abusive or harmful']}
            />
          </RadioGroup>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{dictionary.cancel}</Button>
        <LoadingButton
          variant="contained"
          onClick={handleSendButtonClick}
          color="primary"
          loading={loading}
          disabled={!reason}
        >
          {dictionary.send}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default memo(IssueDialog);
