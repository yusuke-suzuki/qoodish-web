import EmailOutlined from '@mui/icons-material/EmailOutlined';
import {
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography
} from '@mui/material';
import { getAnalytics, logEvent } from 'firebase/analytics';
import {
  type AuthError,
  GoogleAuthProvider,
  getAuth,
  linkWithPopup,
  unlink
} from 'firebase/auth';
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import { memo, useCallback, useContext, useMemo, useState } from 'react';
import AuthContext from '../../context/AuthContext';
import useDictionary from '../../hooks/useDictionary';
import GoogleIcon from '../common/GoogleIcon';
import LinkEmailDialog from './LinkEmailDialog';
import UnlinkProviderDialog from './UnlinkProviderDialog';

const GOOGLE_PROVIDER_ID = 'google.com';
const EMAIL_PROVIDER_ID = 'password';

function ProvidersCard() {
  const dictionary = useDictionary();
  const router = useRouter();
  const { currentUser, setCurrentUser } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [unlinkDialogOpen, setUnlinkDialogOpen] = useState(false);
  const [unlinkTargetProviderId, setUnlinkTargetProviderId] = useState<
    string | null
  >(null);
  const [linkEmailDialogOpen, setLinkEmailDialogOpen] = useState(false);

  const providerData = currentUser?.providerData ?? [];

  const googleProvider = useMemo(
    () => providerData.find((p) => p.providerId === GOOGLE_PROVIDER_ID),
    [providerData]
  );

  const emailProvider = useMemo(
    () => providerData.find((p) => p.providerId === EMAIL_PROVIDER_ID),
    [providerData]
  );

  const canUnlink = providerData.length > 1;

  const handleLinkGoogle = useCallback(async () => {
    if (!currentUser) return;

    setLoading(true);

    try {
      const auth = getAuth();
      auth.languageCode = router.locale;

      const provider = new GoogleAuthProvider();
      await linkWithPopup(currentUser, provider);
      await currentUser.reload();
      setCurrentUser({ ...currentUser });

      enqueueSnackbar(dictionary['link provider success'], {
        variant: 'success'
      });

      const analytics = getAnalytics();
      logEvent(analytics, 'link_provider', { provider: GOOGLE_PROVIDER_ID });
    } catch (error) {
      console.error(error);

      const errorCode = (error as AuthError).code;

      if (errorCode === 'auth/credential-already-in-use') {
        enqueueSnackbar(dictionary['link google error already in use'], {
          variant: 'error'
        });
      } else if (errorCode === 'auth/popup-closed-by-user') {
        enqueueSnackbar(dictionary['link google error popup closed'], {
          variant: 'error'
        });
      } else {
        enqueueSnackbar(dictionary['an error occurred'], {
          variant: 'error'
        });
      }
    } finally {
      setLoading(false);
    }
  }, [currentUser, setCurrentUser, router.locale, dictionary]);

  const handleOpenUnlinkDialog = useCallback((providerId: string) => {
    setUnlinkTargetProviderId(providerId);
    setUnlinkDialogOpen(true);
  }, []);

  const handleUnlink = useCallback(async () => {
    if (!currentUser || !unlinkTargetProviderId) return;

    try {
      await unlink(currentUser, unlinkTargetProviderId);
      await currentUser.reload();
      setCurrentUser({ ...currentUser });

      enqueueSnackbar(dictionary['unlink provider success'], {
        variant: 'success'
      });

      const analytics = getAnalytics();
      logEvent(analytics, 'unlink_provider', {
        provider: unlinkTargetProviderId
      });
    } catch (error) {
      console.error(error);
      enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
    }
  }, [currentUser, setCurrentUser, unlinkTargetProviderId, dictionary]);

  return (
    <>
      <Card elevation={0}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            {dictionary['authentication providers']}
          </Typography>
          <Typography component="p" color="text.secondary" gutterBottom>
            {dictionary['authentication providers detail']}
          </Typography>

          <List>
            <ListItem
              secondaryAction={
                googleProvider ? (
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleOpenUnlinkDialog(GOOGLE_PROVIDER_ID)}
                    disabled={!canUnlink || loading || !currentUser}
                  >
                    {dictionary.unlink}
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="small"
                    onClick={handleLinkGoogle}
                    disabled={loading || !currentUser}
                  >
                    {dictionary.link}
                  </Button>
                )
              }
            >
              <ListItemIcon>
                <GoogleIcon />
              </ListItemIcon>
              <ListItemText
                primary={dictionary.google}
                secondary={googleProvider?.email ?? dictionary['not linked']}
              />
            </ListItem>

            <ListItem
              secondaryAction={
                emailProvider ? (
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleOpenUnlinkDialog(EMAIL_PROVIDER_ID)}
                    disabled={!canUnlink || loading || !currentUser}
                  >
                    {dictionary.unlink}
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="small"
                    onClick={() => setLinkEmailDialogOpen(true)}
                    disabled={loading || !currentUser}
                  >
                    {dictionary.link}
                  </Button>
                )
              }
            >
              <ListItemIcon>
                <EmailOutlined />
              </ListItemIcon>
              <ListItemText
                primary={dictionary['email link provider']}
                secondary={emailProvider?.email ?? dictionary['not linked']}
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      <UnlinkProviderDialog
        open={unlinkDialogOpen}
        onClose={() => setUnlinkDialogOpen(false)}
        onUnlink={handleUnlink}
      />

      <LinkEmailDialog
        open={linkEmailDialogOpen}
        onClose={() => setLinkEmailDialogOpen(false)}
      />
    </>
  );
}

export default memo(ProvidersCard);
