'use client';

import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Link as MuiLink,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import Link from 'next/link';
import { enqueueSnackbar } from 'notistack';
import {
  type ChangeEvent,
  memo,
  useActionState,
  useCallback,
  useContext,
  useId,
  useState
} from 'react';
import {
  createReport,
  type ModeratableType,
  REPORT_CATEGORIES,
  type ReportCategory
} from '../../actions/reports.ts';
import AuthContext from '../../context/AuthContext.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import useLocalePath from '../../hooks/useLocalePath.ts';
import AppDialog from './AppDialog.tsx';

const MAX_DETAILS_LENGTH = 2000;
const SUPPORT_EMAIL = 'support@qoodish.com';
const DETAILS_REQUIRED_CATEGORIES = new Set<ReportCategory>([
  'copyright',
  'privacy',
  'other'
]);

type Props = {
  open: boolean;
  onClose: () => void;
  moderatableType: ModeratableType;
  moderatableId: number | null;
};

function ReportDialog({
  open,
  onClose,
  moderatableType,
  moderatableId
}: Props) {
  const dictionary = useDictionary();
  const localePath = useLocalePath();
  const { authenticated, setSignInRequired } = useContext(AuthContext);

  const formId = useId();
  const categoryLabelId = `${formId}-category-label`;
  const categoryFieldName = `${formId}-category`;
  const detailsFieldName = `${formId}-details`;
  const evidenceFieldName = `${formId}-evidence`;

  const [category, setCategory] = useState<ReportCategory | null>(null);
  const [details, setDetails] = useState('');

  const detailsRequired =
    category !== null && DETAILS_REQUIRED_CATEGORIES.has(category);

  const [, submitAction, isPending] = useActionState<null, FormData>(
    async (_prevState, formData) => {
      const submittedCategory = formData.get(categoryFieldName)?.toString() as
        | ReportCategory
        | undefined;

      if (!submittedCategory || moderatableId === null) {
        return null;
      }

      try {
        const result = await createReport({
          moderatable_type: moderatableType,
          moderatable_id: moderatableId,
          category: submittedCategory,
          details:
            formData.get(detailsFieldName)?.toString().trim() || undefined,
          evidence_url:
            formData.get(evidenceFieldName)?.toString().trim() || undefined
        });

        if (result.success) {
          enqueueSnackbar(dictionary['report received'], {
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

  const handleCategoryChange = useCallback(
    (_event: ChangeEvent<HTMLInputElement>, value: string) => {
      setCategory(value as ReportCategory);
    },
    []
  );

  const handleExited = useCallback(() => {
    setCategory(null);
    setDetails('');
  }, []);

  const handleSignIn = useCallback(() => {
    onClose();
    setSignInRequired(true);
  }, [onClose, setSignInRequired]);

  const termsLink = (
    <Typography variant="caption" color="text.secondary">
      <MuiLink component={Link} href={localePath('/terms')} target="_blank">
        {dictionary['report terms notice']}
      </MuiLink>
    </Typography>
  );

  if (!authenticated) {
    return (
      <AppDialog
        open={open}
        onClose={onClose}
        title={dictionary['report dialog title']}
        maxWidth="xs"
        cancelLabel={dictionary.close}
        confirmAction={{ label: dictionary.login, onClick: handleSignIn }}
        onExited={handleExited}
      >
        <Stack spacing={2}>
          <Typography variant="body2">
            {dictionary['report guest notice']}
          </Typography>

          <MuiLink href={`mailto:${SUPPORT_EMAIL}`} variant="body1">
            {SUPPORT_EMAIL}
          </MuiLink>

          <Typography variant="body2" color="text.secondary">
            {dictionary['report guest required info']}
          </Typography>

          {termsLink}
        </Stack>
      </AppDialog>
    );
  }

  const canSubmit =
    category !== null &&
    moderatableId !== null &&
    (!detailsRequired || details.trim().length > 0);

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title={dictionary['report dialog title']}
      fullScreenOnMobile
      disableClose={isPending}
      disableQuickDismiss
      formAction={submitAction}
      onExited={handleExited}
      confirmAction={{
        label: dictionary.send,
        type: 'submit',
        loading: isPending,
        disabled: !canSubmit
      }}
    >
      <Stack spacing={3}>
        <FormControl required fullWidth>
          <FormLabel id={categoryLabelId} sx={{ mb: 1 }}>
            {dictionary['report category label']}
          </FormLabel>
          <RadioGroup
            aria-labelledby={categoryLabelId}
            name={categoryFieldName}
            value={category ?? ''}
            onChange={handleCategoryChange}
          >
            {REPORT_CATEGORIES.map((value) => (
              <FormControlLabel
                key={value}
                value={value}
                control={<Radio />}
                label={dictionary[`report category ${value}`]}
              />
            ))}
          </RadioGroup>
        </FormControl>

        <TextField
          name={detailsFieldName}
          label={dictionary['report details']}
          value={details}
          onChange={(event) => setDetails(event.target.value)}
          helperText={
            detailsRequired
              ? dictionary['report details help']
              : dictionary.optional
          }
          required={detailsRequired}
          multiline
          minRows={3}
          fullWidth
          disabled={isPending}
          slotProps={{ htmlInput: { maxLength: MAX_DETAILS_LENGTH } }}
        />

        <TextField
          name={evidenceFieldName}
          label={dictionary['report evidence url']}
          type="url"
          helperText={dictionary['report evidence url help']}
          fullWidth
          disabled={isPending}
          slotProps={{ htmlInput: { inputMode: 'url' } }}
        />

        {termsLink}
      </Stack>
    </AppDialog>
  );
}

export default memo(ReportDialog);
