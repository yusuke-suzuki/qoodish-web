import { LoadingButton } from '@mui/lab';
import {
  Card,
  CardActions,
  CardContent,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Switch,
  Typography
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import {
  ChangeEvent,
  memo,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react';
import AuthContext from '../../context/AuthContext';
import ServiceWorkerContext from '../../context/ServiceWorkerContext';
import useDictionary from '../../hooks/useDictionary';
import { useProfile } from '../../hooks/useProfile';
import { usePushManager } from '../../hooks/usePushManager';

function PushNotificationsCard() {
  const dictionary = useDictionary();

  const { registration } = useContext(ServiceWorkerContext);

  const { isSubscribed, subscribe, unsubscribe } = usePushManager(registration);

  const { currentUser } = useContext(AuthContext);
  const { profile } = useProfile(currentUser ? currentUser.uid : null);

  const [loading, setLoading] = useState(false);
  const [likedEnabled, setLikedEnabled] = useState(false);
  const [followedEnabled, setFollowedEnabled] = useState(false);
  const [commentEnabled, setCommentEnabled] = useState(false);

  const handleSubscriptionChange = useCallback(
    async (_event: ChangeEvent<HTMLInputElement>, checked: boolean) => {
      if (checked) {
        const permission = await Notification.requestPermission();

        if (permission === 'granted') {
          await subscribe();

          enqueueSnackbar(dictionary['push enabled'], { variant: 'success' });
        } else {
          enqueueSnackbar(dictionary['push denied'], { variant: 'error' });
        }
      } else {
        await unsubscribe();

        enqueueSnackbar(dictionary['push disabled'], { variant: 'success' });
      }
    },
    [subscribe, unsubscribe, dictionary]
  );

  const handleSave = useCallback(async () => {
    setLoading(true);

    const params = {
      liked: likedEnabled,
      followed: followedEnabled,
      comment: commentEnabled
    };

    const token = await currentUser.getIdToken();

    const headers = new Headers({
      Accept: 'application/json',
      'Accept-Language': window.navigator.language,
      'Content-Type': 'application/json; charset=UTF-8',
      Authorization: `Bearer ${token}`
    });

    const request = new Request(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/users/${currentUser.uid}/push_notification`,
      {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(params)
      }
    );

    try {
      const res = await fetch(request);

      if (res.ok) {
        enqueueSnackbar(dictionary['push update success'], {
          variant: 'success'
        });
      } else {
        const body = await res.json();
        enqueueSnackbar(body.detail, { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [currentUser, likedEnabled, followedEnabled, commentEnabled, dictionary]);

  useEffect(() => {
    if (profile?.push_notification) {
      setLikedEnabled(profile.push_notification.liked);
      setFollowedEnabled(profile.push_notification.followed);
      setCommentEnabled(profile.push_notification.comment);
    }
  }, [profile]);

  return (
    <Card elevation={0}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          {dictionary['push settings']}
        </Typography>
        <Typography component="p" color="text.secondary">
          {dictionary['push settings detail']}
        </Typography>

        <FormControl component="fieldset" color="secondary" margin="normal">
          <FormLabel component="legend">
            {dictionary['device settings']}
          </FormLabel>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  color="secondary"
                  checked={isSubscribed}
                  onChange={handleSubscriptionChange}
                />
              }
              label={dictionary['enable push notification']}
            />
          </FormGroup>
        </FormControl>

        <FormControl component="fieldset" color="secondary" margin="normal">
          <FormLabel component="legend">{dictionary.notifications}</FormLabel>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  color="secondary"
                  checked={likedEnabled}
                  onChange={(
                    _event: ChangeEvent<HTMLInputElement>,
                    checked: boolean
                  ) => setLikedEnabled(checked)}
                />
              }
              label={dictionary['push for liked']}
            />
            <FormControlLabel
              control={
                <Switch
                  color="secondary"
                  checked={followedEnabled}
                  onChange={(
                    _event: ChangeEvent<HTMLInputElement>,
                    checked: boolean
                  ) => setFollowedEnabled(checked)}
                />
              }
              label={dictionary['push for followed']}
            />
            <FormControlLabel
              control={
                <Switch
                  color="secondary"
                  checked={commentEnabled}
                  onChange={(
                    _event: ChangeEvent<HTMLInputElement>,
                    checked: boolean
                  ) => setCommentEnabled(checked)}
                />
              }
              label={dictionary['push for comment']}
            />
          </FormGroup>
        </FormControl>
      </CardContent>
      <CardActions>
        <LoadingButton
          loading={loading}
          variant="contained"
          onClick={handleSave}
          color="secondary"
        >
          {dictionary.save}
        </LoadingButton>
      </CardActions>
    </Card>
  );
}

export default memo(PushNotificationsCard);
