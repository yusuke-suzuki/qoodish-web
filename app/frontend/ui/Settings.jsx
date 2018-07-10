import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import DeleteAccountDialogContainer from '../containers/DeleteAccountDialogContainer';

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
              Delete Account
            </Typography>
            <Typography component="p">
              This cannot be undone. Really.
            </Typography>
          </CardContent>
          <CardActions>
            <Button
              variant="raised"
              onClick={this.props.handleDeleteAccountButtonClick}
              style={styles.deleteButton}
            >
              Delete Account
            </Button>
          </CardActions>
        </Card>
        <DeleteAccountDialogContainer />
      </div>
    );
  }
}
