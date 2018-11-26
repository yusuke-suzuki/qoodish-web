import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import DeleteAccountDialogContainer from '../containers/DeleteAccountDialogContainer';
import I18n from '../containers/I18n';

const styles = {
  rootLarge: {
    margin: '94px auto 20px',
    maxWidth: 700
  },
  rootSmall: {
    padding: 20,
    margin: '56px auto'
  },
  card: {
    marginBottom: 20
  },
  deleteButton: {
    color: 'white',
    backgroundColor: 'red'
  }
};

export default class Invites extends React.PureComponent {
  constructor(props) {
    super(props);
    this.handlePushChange = this.handlePushChange.bind(this);
  }

  componentDidMount() {
    gtag('config', process.env.GA_TRACKING_ID, {
      'page_path': '/settings',
      'page_title': 'Settings | Qoodish'
    });
  }

  handlePushChange(e, checked) {
    if (checked) {
      this.props.handleEnableNotification();
    } else {
      this.props.handleDisableNotification();
    }
  }

  renderPushNotificationCard() {
    return (
      <Card style={styles.card}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            {I18n.t('account settings')}
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={this.props.currentUser.push_enabled}
                onChange={this.handlePushChange}
              />
            }
            label={I18n.t('enable push notification')}
          />
        </CardContent>
      </Card>
    );
  }

  renderDeleteAccountCard() {
    return (
      <Card style={styles.card}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            {I18n.t('delete account')}
          </Typography>
          <Typography component="p">
            {I18n.t('this cannot be undone')}
          </Typography>
        </CardContent>
        <CardActions>
          <Button
            variant="contained"
            onClick={this.props.handleDeleteAccountButtonClick}
            style={this.props.currentUser.isAnonymous ? {} : styles.deleteButton}
            disabled={this.props.currentUser.isAnonymous}
          >
            {I18n.t('delete account')}
          </Button>
        </CardActions>
      </Card>
    );
  }

  render() {
    return (
      <div style={this.props.large ? styles.rootLarge : styles.rootSmall}>
        {this.renderPushNotificationCard()}
        {this.renderDeleteAccountCard()}
        <DeleteAccountDialogContainer />
      </div>
    );
  }
}
