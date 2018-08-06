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

export default class NoContents extends React.Component {
  render() {
    return (
      <div style={styles.container}>
        {this.renderContentsIcon()}
        <Typography variant="subheading" color="inherit">
          {this.props.message}
        </Typography>
        <br />
        {this.renderActions()}
      </div>
    );
  }

  renderContentsIcon() {
    switch (this.props.contentType) {
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

  renderActions() {
    switch (this.props.action) {
      case 'create-map':
        return (
          <Button
            variant="raised"
            color="primary"
            onClick={() => this.props.handleCreateMapButtonClick(this.props.currentUser)}
          >
            {I18n.t('create new map')}
          </Button>
        );
      case 'create-review':
        return (
          <Button
            variant="raised"
            color="primary"
            onClick={() => this.props.handleCreateReviewButtonClick(this.props.currentUser)}
          >
            {I18n.t('create new report')}
          </Button>
        );
      default:
        return null;
    }
  }
}
