import { LoadingButton } from '@mui/lab';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography
} from '@mui/material';
import { getAnalytics, logEvent } from 'firebase/analytics';
import {
  type AuthError,
  OAuthProvider,
  fetchSignInMethodsForEmail,
  getAuth,
  linkWithCredential,
  signInWithPopup
} from 'firebase/auth';
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import { memo, useCallback, useEffect, useState } from 'react';
import useDictionary from '../../hooks/useDictionary';

type Props = {
  currentAuthError: AuthError | null;
  onSignInSuccess: () => void;
};

function LinkAccountDialog({ currentAuthError, onSignInSuccess }: Props) {
  const dictionary = useDictionary();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleLinkClick = useCallback(async () => {
    setLoading(true);

    try {
      const {
        customData: { email }
      } = currentAuthError;

      const auth = getAuth();
      auth.languageCode = router.locale;

      const methods = await fetchSignInMethodsForEmail(auth, email);

      const existingProvider = new OAuthProvider(methods[0]);

      // Sign in with the existing provider
      existingProvider.setCustomParameters({
        login_hint: email
      });
      const result = await signInWithPopup(auth, existingProvider);

      const credential = OAuthProvider.credentialFromError(currentAuthError);

      // Link the existing account with new provider
      await linkWithCredential(result.user, credential);

      enqueueSnackbar(dictionary['sign in success'], {
        variant: 'success'
      });

      setOpen(false);

      onSignInSuccess();

      const analytics = getAnalytics();
      logEvent(analytics, 'login', {
        provider: credential.providerId
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [currentAuthError, onSignInSuccess, router.locale, dictionary]);

  useEffect(() => {
    if (
      currentAuthError &&
      currentAuthError.code === 'auth/account-exists-with-different-credential'
    ) {
      setOpen(true);
    }
  }, [currentAuthError]);

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{dictionary['link providers']}</DialogTitle>
      <DialogContent>
        <Typography color="secondary" align="center" gutterBottom>
          {currentAuthError?.customData?.email}
        </Typography>
        <DialogContentText>
          {dictionary['link providers detail']}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading} color="inherit">
          {dictionary.cancel}
        </Button>
        <LoadingButton
          onClick={handleLinkClick}
          color="secondary"
          loading={loading}
        >
          {dictionary.link}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

export default memo(LinkAccountDialog);
