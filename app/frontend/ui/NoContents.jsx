import React from 'react';
import MapIcon from '@material-ui/icons/Map';
import RateReviewIcon from '@material-ui/icons/RateReview';
import NotificationsIcon from '@material-ui/icons/Notifications';
import PlaceIcon from '@material-ui/icons/Place';
import MailIcon from '@material-ui/icons/Mail';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import I18n from '../containers/I18n';

const styles = {
  container: {
    textAlign: 'center',
    color: '#9e9e9e',
    padding: 20
  },
  icon: {
    width: 150,
    height: 150
  }
};

const ContentsIcon = (props) => {
  switch (props.contentType) {
    case 'map':
      return <MapIcon style={styles.icon} />;
    case 'review':
      return <RateReviewIcon style={styles.icon} />;
    case 'notification':
      return <NotificationsIcon style={styles.icon} />;
    case 'spot':
      return <PlaceIcon style={styles.icon} />;
    case 'invite':
      return <MailIcon style={styles.icon} />;
    default:
      return null;
  }
}

const Actions = (props) => {
  switch (props.action) {
    case 'create-map':
      return (
        <Button
          variant="contained"
          color="primary"
          onClick={() => props.handleCreateMapButtonClick(props.currentUser)}
        >
          {I18n.t('create new map')}
        </Button>
      );
    case 'create-review':
      return (
        <Button
          variant="contained"
          color="primary"
          onClick={() => props.handleCreateReviewButtonClick(props.currentUser)}
        >
          {I18n.t('create new report')}
        </Button>
      );
    default:
      return null;
  }
}

const NoContents = (props) => {
  return (
    <div style={styles.container}>
      <ContentsIcon {...props} />
      <Typography variant="subtitle1" color="inherit">
        {props.message}
      </Typography>
      <br />
      <Actions {...props} />
    </div>
  );
}

export default NoContents;
