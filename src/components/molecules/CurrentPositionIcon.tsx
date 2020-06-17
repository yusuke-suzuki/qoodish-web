import React from 'react';

import Fab from '@material-ui/core/Fab';
import Tooltip from '@material-ui/core/Tooltip';
import Avatar from '@material-ui/core/Avatar';
import I18n from '../../utils/I18n';

const styles = {
  overlayButton: {
    backgroundColor: 'white',
    width: 40,
    height: 40
  }
};

const CurrentPositionIcon = props => {
  const { currentUser, large } = props;

  return (
    <div>
      {large ? (
        <Tooltip title={I18n.t('you are hear')}>
          <Fab style={styles.overlayButton}>
            <Avatar
              src={currentUser.thumbnail_url}
              alt={I18n.t('you are hear')}
            />
          </Fab>
        </Tooltip>
      ) : (
        <Fab style={styles.overlayButton}>
          <Avatar
            src={currentUser.thumbnail_url}
            alt={I18n.t('you are hear')}
          />
        </Fab>
      )}
    </div>
  );
};

export default React.memo(CurrentPositionIcon);
