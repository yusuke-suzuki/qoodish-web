import React from 'react';
import { Typography } from '@material-ui/core';
import I18n from '../../utils/I18n';

const styles = {
  gmapLink: {
    textDecoration: 'none'
  }
};

const GoogleMapsLink = props => {
  const { currentSpot } = props;

  return (
    <Typography variant="subtitle2" color="textSecondary">
      <a
        href={currentSpot && currentSpot.url}
        target="_blank"
        style={styles.gmapLink}
      >
        {I18n.t('open in google maps')}
      </a>
    </Typography>
  );
};

export default React.memo(GoogleMapsLink);
