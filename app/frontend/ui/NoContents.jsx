import React from 'react';
import { Link } from 'react-router-dom';
import MapIcon from '@material-ui/icons/Map';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import SearchIcon from '@material-ui/icons/Search';
import RateReviewIcon from '@material-ui/icons/RateReview';
import NotificationsIcon from '@material-ui/icons/Notifications';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
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
  },
  buttonIcon: {
    marginRight: 8
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
    case 'like':
      return <ThumbUpIcon style={styles.icon} />;
    case 'spot':
      return <PlaceIcon style={styles.icon} />;
    case 'invite':
      return <MailIcon style={styles.icon} />;
    default:
      return null;
  }
};

const PrimaryAction = (props) => {
  switch (props.action) {
    case 'create-map':
      return (
        <Button
          variant="contained"
          color="primary"
          onClick={() => props.handleCreateMapButtonClick(props.currentUser)}
        >
          <AddIcon style={styles.buttonIcon} />
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
          <EditIcon style={styles.buttonIcon} />
          {I18n.t('create new report')}
        </Button>
      );
    case 'discover-reviews':
      return (
        <Button
          color="primary"
          component={Link}
          to="/discover"
        >
          <SearchIcon style={styles.buttonIcon} />
          {I18n.t('discover reviews')}
        </Button>
      );
    default:
      return null;
  }
};

const SecondaryAction = (props) => {
  switch (props.secondaryAction) {
    case 'discover-maps':
      return (
        <Button
          color="primary"
          component={Link}
          to="/discover"
        >
          <SearchIcon style={styles.buttonIcon} />
          {I18n.t('discover maps')}
        </Button>
      );
    case 'discover-reviews':
      return (
        <Button
          color="primary"
          component={Link}
          to="/discover"
        >
          <SearchIcon style={styles.buttonIcon} />
          {I18n.t('discover reviews')}
        </Button>
      );
    default:
      return null;
  }
};

const NoContents = (props) => {
  return (
    <div style={styles.container}>
      <ContentsIcon {...props} />
      <Typography variant="subtitle1" color="inherit">
        {props.message}
      </Typography>
      <br />
      <div>
        <PrimaryAction {...props} />
      </div>
      <br />
      <div>
        <SecondaryAction {...props} />
      </div>
    </div>
  );
};

export default NoContents;
