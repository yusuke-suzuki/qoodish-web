import React, { Component } from 'react';
import DeleteAccountDialogContainer from '../containers/DeleteAccountDialogContainer';
import Card, { CardActions, CardContent } from 'material-ui/Card';
import Button from 'material-ui/Button';
import Typography from 'material-ui/Typography';

const styles = {
  rootLarge: {
    marginTop: 94
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

export default class Invites extends Component {
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
