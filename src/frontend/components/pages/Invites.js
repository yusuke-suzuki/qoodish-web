import React, { useCallback, useEffect, useState } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';

import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import moment from 'moment';

import NoContents from '../molecules/NoContents';
import CreateResourceButton from '../molecules/CreateResourceButton';

import I18n from '../../utils/I18n';
import ApiClient from '../../utils/ApiClient';
import openToast from '../../actions/openToast';
import requestStart from '../../actions/requestStart';
import requestFinish from '../../actions/requestFinish';

const styles = {
  rootLarge: {
    margin: '94px auto 20px',
    maxWidth: 700
  },
  rootSmall: {
    padding: 20,
    margin: '56px auto'
  },
  cardLarge: {
    marginBottom: 20
  },
  cardSmall: {
    marginBottom: 16
  },
  cardContent: {
    paddingTop: 0
  },
  contentText: {
    wordBreak: 'break-all'
  },
  progress: {
    textAlign: 'center',
    padding: 10,
    marginTop: 20
  }
};
const createdAt = invite => {
  return moment(invite.created_at, 'YYYY-MM-DDThh:mm:ss.SSSZ')
    .locale(window.currentLocale)
    .format('LL');
};

const Invites = () => {
  const large = useMediaQuery('(min-width: 600px)');
  const dispatch = useDispatch();
  const mapState = useCallback(
    state => ({
      currentUser: state.app.currentUser,
      history: state.shared.history
    }),
    []
  );
  const { currentUser, history } = useMappedState(mapState);

  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInvites = useCallback(async () => {
    if (!currentUser || currentUser.isAnonymous) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const client = new ApiClient();
    const response = await client.fetchInvites();
    if (response.ok) {
      let json = await response.json();
      setInvites(json);
    } else {
      dispatch(openToast('Failed to fetch invites'));
    }
    setLoading(false);
  });

  const handleFollowButtonClick = useCallback(async invite => {
    dispatch(requestStart());
    const client = new ApiClient();
    const response = await client.followMap(invite.invitable.id, invite.id);
    dispatch(requestFinish());
    if (response.ok) {
      dispatch(openToast(I18n.t('follow map success')));
      history.push(`/maps/${invite.invitable.id}`);
      gtag('event', 'follow', {
        event_category: 'engagement',
        event_label: 'map'
      });
    } else {
      dispatch(openToast('Failed to follow map'));
    }
  });

  useEffect(() => {
    fetchInvites();

    gtag('config', process.env.GA_TRACKING_ID, {
      page_path: '/invites',
      page_title: `${I18n.t('invites')} | Qoodish'`
    });
  }, []);

  return (
    <div style={large ? styles.rootLarge : styles.rootSmall}>
      <div>
        {loading ? (
          <div style={styles.progress}>
            <CircularProgress />
          </div>
        ) : invites.length > 0 ? (
          invites.map(invite => (
            <Card
              key={invite.id}
              style={large ? styles.cardLarge : styles.cardSmall}
            >
              <CardHeader
                avatar={<Avatar src={invite.invitable.image_url} />}
                title={invite.invitable.name}
                subheader={createdAt(invite)}
              />
              <CardContent style={styles.cardContent}>
                <Typography component="p" style={styles.contentText}>
                  {invite.invitable.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleFollowButtonClick(invite)}
                  disabled={invite.expired}
                >
                  {I18n.t('follow')}
                </Button>
              </CardActions>
            </Card>
          ))
        ) : (
          <NoContents
            contentType="invite"
            message={I18n.t('no invites here')}
          />
        )}
      </div>
      {large && <CreateResourceButton />}
    </div>
  );
};

export default React.memo(Invites);
