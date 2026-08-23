'use client';

import {
  Button,
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
import { useRouter } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import {
  type ChangeEvent,
  memo,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react';
import { updatePreferences } from '../../actions/users';
import ProfileContext from '../../context/ProfileContext';
import ServiceWorkerContext from '../../context/ServiceWorkerContext';
import useDictionary from '../../hooks/useDictionary';
import { usePushManager } from '../../hooks/usePushManager';

function PushNotificationsCard() {
  const dictionary = useDictionary();
  const router = useRouter();

  const { registration } = useContext(ServiceWorkerContext);

  const { isSubscribed, subscribe, unsubscribe } = usePushManager(registration);

  const profile = useContext(ProfileContext);

  const [loading, setLoading] = useState(false);
  const [likedEnabled, setLikedEnabled] = useState(false);
  const [coauthorInvitedEnabled, setCoauthorInvitedEnabled] = useState(false);
  const [commentEnabled, setCommentEnabled] = useState(false);
  const [publishedEnabled, setPublishedEnabled] = useState(false);

  const handleSubscriptionChange = useCallback(
    async (_event: ChangeEvent<HTMLInputElement>, checked: boolean) => {
      try {
        if (checked) {
          const permission = await Notification.requestPermission();

          if (permission === 'granted') {
            await subscribe();

            enqueueSnackbar(dictionary['push enabled'], { variant: 'success' });
          } else {
            enqueueSnackbar(dictionary['push denied'], { variant: 'error' });
          }
        } else if (await unsubscribe()) {
          enqueueSnackbar(dictionary['push disabled'], { variant: 'success' });
        } else {
          enqueueSnackbar(dictionary['an error occurred'], {
            variant: 'error'
          });
        }
      } catch (error) {
        console.error('Failed to change push subscription', error);

        enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
      }
    },
    [subscribe, unsubscribe, dictionary]
  );

  const handleSave = useCallback(async () => {
    setLoading(true);

    try {
      const result = await updatePreferences({
        web_push: {
          liked: likedEnabled,
          coauthor_invited: coauthorInvitedEnabled,
          comment: commentEnabled,
          published: publishedEnabled
        }
      });

      if (result.success) {
        enqueueSnackbar(dictionary['push update success'], {
          variant: 'success'
        });

        router.refresh();
      } else {
        enqueueSnackbar(result.error, { variant: 'error' });
      }
    } catch (_error) {
      enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [
    likedEnabled,
    coauthorInvitedEnabled,
    commentEnabled,
    publishedEnabled,
    dictionary,
    router
  ]);

  useEffect(() => {
    if (profile?.push_notification) {
      setLikedEnabled(profile.push_notification.liked);
      setCoauthorInvitedEnabled(profile.push_notification.coauthor_invited);
      setCommentEnabled(profile.push_notification.comment);
      setPublishedEnabled(profile.push_notification.published);
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

        <FormControl
          component="fieldset"
          color="secondary"
          margin="normal"
          disabled={!registration}
        >
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
                  checked={coauthorInvitedEnabled}
                  onChange={(
                    _event: ChangeEvent<HTMLInputElement>,
                    checked: boolean
                  ) => setCoauthorInvitedEnabled(checked)}
                />
              }
              label={dictionary['push for invited']}
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
            <FormControlLabel
              control={
                <Switch
                  color="secondary"
                  checked={publishedEnabled}
                  onChange={(
                    _event: ChangeEvent<HTMLInputElement>,
                    checked: boolean
                  ) => setPublishedEnabled(checked)}
                />
              }
              label={dictionary['push for published']}
            />
          </FormGroup>
        </FormControl>
      </CardContent>
      <CardActions>
        <Button
          loading={loading}
          variant="contained"
          onClick={handleSave}
          color="secondary"
        >
          {dictionary.save}
        </Button>
      </CardActions>
    </Card>
  );
}

export default memo(PushNotificationsCard);
