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
  useActionState,
  useCallback,
  useEffect,
  useId,
  useState
} from 'react';
import { createIssue } from '../../actions/issues';
import useDictionary from '../../hooks/useDictionary';

type Props = {
  open: boolean;
  onClose: () => void;
  contentId: number | null;
  contentType: string;
};

type IssueFormState = {
  error: string | null;
};

const initialState: IssueFormState = { error: null };

const IssueDialog = ({ open, onClose, contentId, contentType }: Props) => {
  const dictionary = useDictionary();
  const formId = useId();
  const labelId = `${formId}-label`;
  const reasonFieldName = `${formId}-reason`;

  const [reason, setReason] = useState<string | undefined>(undefined);

  const [state, submitAction, isPending] = useActionState<
    IssueFormState,
    FormData
  >(async (_prevState, formData) => {
    const submittedReason = formData.get(reasonFieldName)?.toString();

    try {
      const result = await createIssue({
        content_id: contentId,
        content_type: contentType,
        reason_id: Number(submittedReason)
      });

      if (result.success) {
        enqueueSnackbar(dictionary['create issue success'], {
          variant: 'success'
        });

        onClose();
        return { error: null };
      }

      return { error: result.error ?? dictionary['an error occurred'] };
    } catch (_error) {
      return { error: dictionary['an error occurred'] };
    }
  }, initialState);

  useEffect(() => {
    if (state.error) {
      enqueueSnackbar(state.error, { variant: 'error' });
    }
  }, [state]);

  const handleReasonChange = useCallback(
    (_event: ChangeEvent<HTMLInputElement>, value: string) => {
      setReason(value);
    },
    []
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <form action={submitAction}>
        <DialogTitle>{dictionary['report inappropriate content']}</DialogTitle>
        <DialogContent>
          <FormControl required>
            <FormLabel id={labelId} focused>
              {dictionary['report inappropriate content detail']}
            </FormLabel>
            <br />
            <RadioGroup
              aria-labelledby={labelId}
              name={reasonFieldName}
              value={reason ?? ''}
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
          <Button onClick={onClose} type="button" disabled={isPending}>
            {dictionary.cancel}
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            loading={isPending}
            disabled={!reason}
          >
            {dictionary.send}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default memo(IssueDialog);
