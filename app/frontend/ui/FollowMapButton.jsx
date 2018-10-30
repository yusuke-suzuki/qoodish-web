import React from 'react';
import Button from '@material-ui/core/Button';
import I18n from '../containers/I18n';

const RoleButton = (props) => {
  if (props.currentMap.editable) {
    return (
      <Button variant="contained" disabled>
        {I18n.t('owner')}
      </Button>
    );
  } else if (props.currentMap.following) {
    return (
      <Button variant="contained" onClick={props.handleUnfollowButtonClick}>
        {I18n.t('following')}
      </Button>
    );
  } else {
    return (
      <Button
        variant="contained"
        onClick={() => props.handleFollowButtonClick(props.currentUser)}
        color="primary"
      >
        {I18n.t('follow')}
      </Button>
    );
  }
}

const FollowMapButton = (props) => {
  return (
    <div>
      {props.currentMap ? (
        <RoleButton {...props} />
      ) : (
        <Button variant="contained" color="secondary" disabled>{''}</Button>
      )}
    </div>
  );
}

export default FollowMapButton;
