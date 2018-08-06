import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
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
  deleteButton: {
    color: 'white',
    backgroundColor: 'red'
  }
};

export default class Invites extends React.Component {
  componentWillMount() {
    this.props.updatePageTitle();
    gtag('config', process.env.GA_TRACKING_ID, {
      'page_path': '/settings',
      'page_title': 'Settings | Qoodish'
    });
  }

  render() {
    return (
      <div style={this.props.large ? styles.rootLarge : styles.rootSmall}>
        <Card>
          <CardContent>
            <Typography variant="headline" component="h2" gutterBottom>
              {I18n.t('delete account')}
            </Typography>
            <Typography component="p">
              {I18n.t('this cannot be undone')}
            </Typography>
          </CardContent>
          <CardActions>
            <Button
              variant="raised"
              onClick={this.props.handleDeleteAccountButtonClick}
              style={this.props.currentUser.isAnonymous ? {} : styles.deleteButton}
              disabled={this.props.currentUser.isAnonymous}
            >
              {I18n.t('delete account')}
            </Button>
          </CardActions>
        </Card>
        <DeleteAccountDialogContainer />
      </div>
    );
  }
}
