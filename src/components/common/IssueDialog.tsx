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
import { type ChangeEvent, memo, useCallback, useState } from 'react';
import { createIssue } from '../../actions/issues';
import useDictionary from '../../hooks/useDictionary';

type Props = {
  open: boolean;
  onClose: () => void;
  contentId: number | null;
  contentType: string;
};

const IssueDialog = ({ open, onClose, contentId, contentType }: Props) => {
  const dictionary = useDictionary();

  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState<string | undefined>(undefined);

  const handleSendButtonClick = useCallback(async () => {
    setLoading(true);

    try {
      const result = await createIssue({
        content_id: contentId,
        content_type: contentType,
        reason_id: Number(reason)
      });

      if (result.success) {
        enqueueSnackbar(dictionary['create issue success'], {
          variant: 'success'
        });

        onClose();
      } else {
        enqueueSnackbar(result.error, { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [contentId, contentType, reason, dictionary, onClose]);

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
        <Button
          variant="contained"
          onClick={handleSendButtonClick}
          color="primary"
          loading={loading}
          disabled={!reason}
        >
          {dictionary.send}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default memo(IssueDialog);
