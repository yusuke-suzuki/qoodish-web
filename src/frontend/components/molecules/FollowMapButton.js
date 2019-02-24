import React, { useCallback } from 'react';
import { useDispatch, useMappedState } from 'redux-react-hook';

import Button from '@material-ui/core/Button';
import I18n from '../../utils/I18n';

import openLeaveMapDialog from '../../actions/openLeaveMapDialog';
import openSignInRequiredDialog from '../../actions/openSignInRequiredDialog';
import requestStart from '../../actions/requestStart';
import requestFinish from '../../actions/requestFinish';
import fetchCollaborators from '../../actions/fetchCollaborators';
import joinMap from '../../actions/joinMap';
import openToast from '../../actions/openToast';
import { CollaboratorsApi, FollowsApi } from 'qoodish_api';
import initializeApiClient from '../../utils/initializeApiClient';

const RoleButton = props => {
  const currentUser = useMappedState(
    useCallback(state => state.app.currentUser, [])
  );
  const map = props.currentMap;
  const dispatch = useDispatch();

  const handleUnfollowButtonClick = useCallback(() => {
    dispatch(openLeaveMapDialog(map));
  });

  const handleFollowButtonClick = useCallback(async () => {
    if (currentUser.isAnonymous) {
      dispatch(openSignInRequiredDialog());
      return;
    }
    dispatch(requestStart());
    await initializeApiClient();
    const apiInstance = new FollowsApi();

    apiInstance.mapsMapIdFollowPost(map.id, {}, (error, data, response) => {
      dispatch(requestFinish());

      if (response.ok) {
        dispatch(joinMap(response.body));
        dispatch(openToast(I18n.t('follow map success')));

        gtag('event', 'follow', {
          event_category: 'engagement',
          event_label: 'map'
        });

        const apiInstance = new CollaboratorsApi();

        apiInstance.mapsMapIdCollaboratorsGet(
          map.id,
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
    });
  });

  if (map.editable) {
    return (
      <Button variant="contained" disabled>
        {I18n.t('owner')}
      </Button>
    );
  } else if (map.following) {
    return (
      <Button variant="contained" onClick={handleUnfollowButtonClick}>
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
};

const FollowMapButton = props => {
  return (
    <div>
      {props.currentMap ? (
        <RoleButton {...props} />
      ) : (
        <Button variant="contained" color="secondary" disabled>
          {''}
        </Button>
      )}
    </div>
  );
};

export default React.memo(FollowMapButton);
