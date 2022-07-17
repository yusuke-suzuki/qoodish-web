import { memo, useCallback, useContext } from 'react';
import { useDispatch } from 'redux-react-hook';

import openLeaveMapDialog from '../../actions/openLeaveMapDialog';
import openSignInRequiredDialog from '../../actions/openSignInRequiredDialog';
import requestStart from '../../actions/requestStart';
import requestFinish from '../../actions/requestFinish';
import fetchCollaborators from '../../actions/fetchCollaborators';
import joinMap from '../../actions/joinMap';
import openToast from '../../actions/openToast';
import {
  CollaboratorsApi,
  FollowsApi
} from '@yusuke-suzuki/qoodish-api-js-client';
import AuthContext from '../../context/AuthContext';
import { Button, createStyles, makeStyles } from '@material-ui/core';
import { getAnalytics, logEvent } from 'firebase/analytics';
import { useLocale } from '../../hooks/useLocale';

const useStyles = makeStyles(() =>
  createStyles({
    skelton: {
      height: 36
    }
  })
);

type Props = {
  currentMap?: any;
};

const RoleButton = memo((props: Props) => {
  const { currentMap } = props;
  const { currentUser } = useContext(AuthContext);
  const dispatch = useDispatch();
  const { I18n } = useLocale();

  const handleUnfollowButtonClick = useCallback(() => {
    dispatch(openLeaveMapDialog(currentMap));
  }, [dispatch, currentMap]);

  const handleFollowButtonClick = useCallback(async () => {
    if (currentUser.isAnonymous) {
      dispatch(openSignInRequiredDialog());
      return;
    }
    dispatch(requestStart());
    const apiInstance = new FollowsApi();

    apiInstance.mapsMapIdFollowPost(
      currentMap.id,
      {},
      (error, data, response) => {
        dispatch(requestFinish());

        if (response.ok) {
          dispatch(joinMap(response.body));
          dispatch(openToast(I18n.t('follow map success')));

          const analytics = getAnalytics();

          logEvent(analytics, 'join_group', {
            group_id: currentMap.id
          });

          const apiInstance = new CollaboratorsApi();

          apiInstance.mapsMapIdCollaboratorsGet(
            currentMap.id,
            (error, data, response) => {
              if (response.ok) {
                dispatch(fetchCollaborators(response.body));
              } else {
                console.log('API called successfully. Returned data: ' + data);
              }
            }
          );
        } else {
          dispatch(openToast('Failed to follow map'));
          console.log('API called successfully. Returned data: ' + data);
        }
      }
    );
  }, [dispatch, currentUser, currentMap, getAnalytics, logEvent]);

  if (currentMap.editable) {
    return (
      <Button variant="contained" disabled>
        {I18n.t('owner')}
      </Button>
    );
  } else if (currentMap.following) {
    return (
      <Button
        variant="outlined"
        color="primary"
        onClick={handleUnfollowButtonClick}
      >
        {I18n.t('following')}
      </Button>
    );
  } else {
    return (
      <Button
        variant="contained"
        onClick={handleFollowButtonClick}
        color="primary"
      >
        {I18n.t('follow')}
      </Button>
    );
  }
});

export default memo(function FollowMapButton(props: Props) {
  const { currentMap } = props;
  const classes = useStyles();

  return currentMap ? (
    <RoleButton {...props} />
  ) : (
    <Button
      variant="contained"
      color="secondary"
      disabled
      className={classes.skelton}
    >
      {''}
    </Button>
  );
});
