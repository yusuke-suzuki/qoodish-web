import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useDispatch } from 'redux-react-hook';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';

import I18n from '../../utils/I18n';
import openToast from '../../actions/openToast';
import requestStart from '../../actions/requestStart';
import requestFinish from '../../actions/requestFinish';
import {
  ApiClient,
  FollowsApi,
  InvitesApi
} from '@yusuke-suzuki/qoodish-api-js-client';
import { createStyles, makeStyles } from '@material-ui/core';
import AuthContext from '../../context/AuthContext';
import NoContents from '../../components/molecules/NoContents';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Head from 'next/head';
import { format } from 'date-fns';
import { enUS, ja } from 'date-fns/locale';
import { getAnalytics, logEvent } from 'firebase/analytics';

const useStyles = makeStyles(theme =>
  createStyles({
    card: {
      marginBottom: theme.spacing(2),
      [theme.breakpoints.up('sm')]: {
        marginBottom: 20
      }
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
  })
);

const createdAt = invite => {
  return format(new Date(invite.created_at), 'yyyy-MM-dd', {
    locale: I18n.locale.includes('ja') ? ja : enUS
  });
};

const Invites = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const router = useRouter();
  const { currentUser } = useContext(AuthContext);

  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInvites = useCallback(async () => {
    setLoading(true);
    const apiInstance = new InvitesApi();

    apiInstance.invitesGet((error, data, response) => {
      setLoading(false);
      if (response.ok) {
        setInvites(response.body);
      } else {
        dispatch(openToast('Failed to fetch invites'));
      }
    });
  }, [dispatch]);

  const handleFollowButtonClick = useCallback(
    async invite => {
      dispatch(requestStart());

      const apiInstance = new FollowsApi();
      const firebaseAuth = ApiClient.instance.authentications['firebaseAuth'];
      firebaseAuth.apiKey = await currentUser.getIdToken();
      firebaseAuth.apiKeyPrefix = 'Bearer';
      const opts = {
        inviteId: invite.id
      };

      apiInstance.mapsMapIdFollowPost(
        invite.invitable.id,
        opts,
        (error, data, response) => {
          dispatch(requestFinish());
          if (response.ok) {
            dispatch(openToast(I18n.t('follow map success')));
            router.push(`/maps/${invite.invitable.id}`);

            const analytics = getAnalytics();

            logEvent(analytics, 'join_group', {
              group_id: invite.invitable.id
            });
          } else {
            dispatch(openToast('Failed to follow map'));
          }
        }
      );
    },
    [dispatch, router, currentUser, getAnalytics, logEvent]
  );

  useEffect(() => {
    if (!currentUser || !currentUser.uid || currentUser.isAnonymous) {
      setLoading(false);
      return;
    }
    fetchInvites();
  }, [currentUser]);

  return (
    <Layout hideBottomNav={false} fullWidth={false}>
      <Head>
        <title>{`${I18n.t('invites')} | Qoodish`}</title>
        <link
          rel="canonical"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}/invites`}
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}/invites?hl=en`}
          hrefLang="en"
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}/invites?hl=ja`}
          hrefLang="ja"
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}/invites`}
          hrefLang="x-default"
        />
        <meta
          name="keywords"
          content="Qoodish, qoodish, 食べ物, グルメ, 食事, マップ, 地図, 友だち, グループ, 旅行, 観光, maps, travel, food, group, trip"
        />
        <meta name="title" content={`${I18n.t('invites')} | Qoodish`} />
        <meta name="description" content={I18n.t('meta description')} />
        <meta property="og:title" content={`${I18n.t('invites')} | Qoodish`} />
        <meta property="og:description" content={I18n.t('meta description')} />
        <meta
          property="og:url"
          content={`${process.env.NEXT_PUBLIC_ENDPOINT}/invites`}
        />
        <meta property="og:image" content={process.env.NEXT_PUBLIC_OGP_IMAGE} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:image"
          content={process.env.NEXT_PUBLIC_OGP_IMAGE}
        />
        <meta name="twitter:title" content={`${I18n.t('invites')} | Qoodish`} />
        <meta name="twitter:description" content={I18n.t('meta description')} />
        <meta property="og:locale" content={I18n.locale} />
        <meta property="og:site_name" content={I18n.t('meta headline')} />
      </Head>

      <div>
        {loading ? (
          <div className={classes.progress}>
            <CircularProgress />
          </div>
        ) : invites.length > 0 ? (
          invites.map(invite => (
            <Card key={invite.id} className={classes.card} elevation={0}>
              <CardHeader
                avatar={<Avatar src={invite.invitable.image_url} />}
                title={invite.invitable.name}
                subheader={createdAt(invite)}
              />
              <CardContent className={classes.cardContent}>
                <Typography component="p" className={classes.contentText}>
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
    </Layout>
  );
};

export default React.memo(Invites);
