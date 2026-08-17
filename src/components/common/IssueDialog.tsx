import {
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
  useId,
  useState
} from 'react';
import { createIssue } from '../../actions/issues';
import useDictionary from '../../hooks/useDictionary';
import AppDialog from './AppDialog';

type Props = {
  open: boolean;
  onClose: () => void;
  contentId: number | null;
  contentType: string;
};

const IssueDialog = ({ open, onClose, contentId, contentType }: Props) => {
  const dictionary = useDictionary();
  const formId = useId();
  const labelId = `${formId}-label`;
  const reasonFieldName = `${formId}-reason`;

  const [reason, setReason] = useState<string | undefined>(undefined);

  const [, submitAction, isPending] = useActionState<null, FormData>(
    async (_prevState, formData) => {
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
          return null;
        }

        enqueueSnackbar(result.error ?? dictionary['an error occurred'], {
          variant: 'error'
        });
        return null;
      } catch (_error) {
        enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
        return null;
      }
    },
    null
  );

  const handleReasonChange = useCallback(
    (_event: ChangeEvent<HTMLInputElement>, value: string) => {
      setReason(value);
    },
    []
  );

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title={dictionary['report inappropriate content']}
      disableClose={isPending}
      formAction={submitAction}
      confirmAction={{
        label: dictionary.send,
        type: 'submit',
        loading: isPending,
        disabled: !reason
      }}
    >
      <FormControl required fullWidth>
        <FormLabel id={labelId} sx={{ mb: 1 }}>
          {dictionary['report inappropriate content detail']}
        </FormLabel>
        <RadioGroup
          aria-labelledby={labelId}
          name={reasonFieldName}
          value={reason ?? ''}
          onChange={handleReasonChange}
        >
          <FormControlLabel
            value="0"
            control={<Radio />}
            label={dictionary['not interested in']}
          />
          <FormControlLabel
            value="1"
            control={<Radio />}
            label={dictionary.spam}
          />
          <FormControlLabel
            value="2"
            control={<Radio />}
            label={dictionary.sensitive}
          />
          <FormControlLabel
            value="3"
            control={<Radio />}
            label={dictionary['abusive or harmful']}
          />
        </RadioGroup>
      </FormControl>
    </AppDialog>
  );
};

export default memo(IssueDialog);
