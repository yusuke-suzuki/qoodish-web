import EmailOutlined from '@mui/icons-material/EmailOutlined';
import Google from '@mui/icons-material/Google';
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
  EmailAuthProvider,
  GoogleAuthProvider,
  getAuth,
  linkWithPopup,
  unlink
} from 'firebase/auth';
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import {
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import AuthContext from '../../context/AuthContext';
import useDictionary from '../../hooks/useDictionary';
import LinkEmailDialog from './LinkEmailDialog';
import UnlinkProviderDialog from './UnlinkProviderDialog';

function ProvidersCard() {
  const dictionary = useDictionary();
  const router = useRouter();
  const { currentUser } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [unlinkDialogOpen, setUnlinkDialogOpen] = useState(false);
  const [unlinkTargetProviderId, setUnlinkTargetProviderId] = useState<
    string | null
  >(null);
  const [linkEmailDialogOpen, setLinkEmailDialogOpen] = useState(false);
  const [providerData, setProviderData] = useState(
    currentUser?.providerData ?? []
  );

  useEffect(() => {
    setProviderData(currentUser?.providerData ?? []);
  }, [currentUser]);

  const googleProvider = useMemo(
    () =>
      providerData.find((p) => p.providerId === GoogleAuthProvider.PROVIDER_ID),
    [providerData]
  );

  const emailProvider = useMemo(
    () =>
      providerData.find((p) => p.providerId === EmailAuthProvider.PROVIDER_ID),
    [providerData]
  );

  const canUnlink = [googleProvider, emailProvider].filter(Boolean).length > 1;

  const handleLinkGoogle = useCallback(async () => {
    if (!currentUser) return;

    setLoading(true);

    try {
      const auth = getAuth();
      auth.languageCode = router.locale;

      const provider = new GoogleAuthProvider();
      await linkWithPopup(currentUser, provider);
      await currentUser.reload();
      setProviderData([...currentUser.providerData]);

      enqueueSnackbar(dictionary['link provider success'], {
        variant: 'success'
      });

      const analytics = getAnalytics();
      logEvent(analytics, 'link_provider', {
        provider: GoogleAuthProvider.PROVIDER_ID
      });
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
  }, [currentUser, router.locale, dictionary]);

  const handleOpenUnlinkDialog = useCallback((providerId: string) => {
    setUnlinkTargetProviderId(providerId);
    setUnlinkDialogOpen(true);
  }, []);

  const handleUnlink = useCallback(async () => {
    if (!currentUser || !unlinkTargetProviderId) return;

    try {
      await unlink(currentUser, unlinkTargetProviderId);
      await currentUser.reload();
      setProviderData([...currentUser.providerData]);

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
  }, [currentUser, unlinkTargetProviderId, dictionary]);

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
            <ListItem>
              <ListItemIcon>
                <Google />
              </ListItemIcon>
              <ListItemText
                primary={dictionary.google}
                secondary={googleProvider?.email ?? dictionary['not linked']}
                slotProps={{ secondary: { noWrap: true } }}
              />
              {googleProvider ? (
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  sx={{ flexShrink: 0 }}
                  onClick={() =>
                    handleOpenUnlinkDialog(GoogleAuthProvider.PROVIDER_ID)
                  }
                  disabled={!canUnlink || loading || !currentUser}
                >
                  {dictionary.unlink}
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  color="secondary"
                  size="small"
                  sx={{ flexShrink: 0 }}
                  onClick={handleLinkGoogle}
                  disabled={loading || !currentUser}
                >
                  {dictionary.link}
                </Button>
              )}
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <EmailOutlined />
              </ListItemIcon>
              <ListItemText
                primary={dictionary['email link provider']}
                secondary={emailProvider?.email ?? dictionary['not linked']}
                slotProps={{ secondary: { noWrap: true } }}
              />
              {emailProvider ? (
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  sx={{ flexShrink: 0 }}
                  onClick={() =>
                    handleOpenUnlinkDialog(EmailAuthProvider.PROVIDER_ID)
                  }
                  disabled={!canUnlink || loading || !currentUser}
                >
                  {dictionary.unlink}
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  color="secondary"
                  size="small"
                  sx={{ flexShrink: 0 }}
                  onClick={() => setLinkEmailDialogOpen(true)}
                  disabled={loading || !currentUser}
                >
                  {dictionary.link}
                </Button>
              )}
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
