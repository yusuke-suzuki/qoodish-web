import React, { useEffect, useCallback, useState, useContext } from 'react';

import Link from 'next/link';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Avatar from '@material-ui/core/Avatar';
import ButtonBase from '@material-ui/core/ButtonBase';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import CircularProgress from '@material-ui/core/CircularProgress';

import NoContents from '../molecules/NoContents';

import { ApiClient, LikesApi } from '@yusuke-suzuki/qoodish-api-js-client';
import AuthContext from '../../context/AuthContext';
import { Box, createStyles, makeStyles, Theme } from '@material-ui/core';
import { useRouter } from 'next/router';
import { memo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { enUS, ja } from 'date-fns/locale';
import { useLocale } from '../../hooks/useLocale';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    listItemText: {
      paddingRight: theme.spacing(4)
    },
    secondaryAvatar: {
      marginRight: 12,
      cursor: 'pointer'
    },
    progress: {
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(3)
    }
  })
);

type TextProps = {
  like: any;
};

const PrimaryText = memo((props: TextProps) => {
  const { like } = props;
  const { I18n } = useLocale();

  switch (like.votable.type) {
    case 'review':
      return (
        <Typography variant="subtitle1">
          <b>{like.voter.name}</b>
          {` ${I18n.t('liked report of').replace(
            'owner',
            like.votable.owner.name
          )}`}
          <b>{like.votable.name}</b>
        </Typography>
      );
    case 'map':
      return (
        <Typography variant="subtitle1">
          <b>{like.voter.name}</b>
          {` ${I18n.t('liked map of').replace(
            'owner',
            like.votable.owner.name
          )}`}
          <b>{like.votable.name}</b>
        </Typography>
      );
    default:
      return null;
  }
});

type Props = {
  userId: string;
};

const LikesList = (props: Props) => {
  const { userId } = props;
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState<boolean>(true);

  const { currentUser } = useContext(AuthContext);

  const router = useRouter();

  const initUserLikes = useCallback(async () => {
    if (router.pathname === '/profile' && currentUser.isAnonymous) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const uid = userId ? userId : currentUser.uid;

    const firebaseAuth = ApiClient.instance.authentications['firebaseAuth'];
    firebaseAuth.apiKey = await currentUser.getIdToken();
    firebaseAuth.apiKeyPrefix = 'Bearer';
    const apiInstance = new LikesApi();

    apiInstance.usersUserIdLikesGet(uid, (error, data, response) => {
      setLoading(false);
      if (response.ok) {
        setLikes(response.body);
      }
    });
  }, [userId, currentUser]);

  useEffect(() => {
    initUserLikes();
  }, []);

  const classes = useStyles();
  const { I18n } = useLocale();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" className={classes.progress}>
        <CircularProgress />
      </Box>
    );
  } else {
    return likes.length > 0 ? (
      <Paper elevation={0}>
        <List>
          {likes.map(like => (
            <Link key={like.id} href={like.click_action} passHref>
              <ListItem button>
                <ListItemAvatar>
                  <>
                    {like.voter.profile_image_url ? (
                      <Avatar
                        src={like.voter.profile_image_url}
                        alt={like.voter.name}
                        imgProps={{
                          loading: 'lazy'
                        }}
                      />
                    ) : (
                      <Avatar alt={like.voter.name}>
                        {like.voter.name.slice(0, 1)}
                      </Avatar>
                    )}
                  </>
                </ListItemAvatar>
                <ListItemText
                  className={classes.listItemText}
                  primary={<PrimaryText like={like} />}
                  secondary={formatDistanceToNow(new Date(like.created_at), {
                    addSuffix: true,
                    locale: router.locale === 'ja' ? ja : enUS
                  })}
                  disableTypography
                />
                {like.votable.thumbnail_url && (
                  <ListItemSecondaryAction>
                    <Link key={like.id} href={like.click_action} passHref>
                      <ButtonBase>
                        <Avatar
                          src={like.votable.thumbnail_url}
                          variant="rounded"
                          className={classes.secondaryAvatar}
                          imgProps={{
                            loading: 'lazy'
                          }}
                        />
                      </ButtonBase>
                    </Link>
                  </ListItemSecondaryAction>
                )}
              </ListItem>
            </Link>
          ))}
        </List>
      </Paper>
    ) : (
      <NoContents
        contentType="like"
        action="discover-reviews"
        message={I18n.t('likes will see here')}
      />
    );
  }
};

export default memo(LikesList);
