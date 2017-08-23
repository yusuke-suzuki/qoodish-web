import React, { Component } from 'react';
import DeleteAccountDialogContainer from '../containers/DeleteAccountDialogContainer';
import Card, { CardActions, CardContent } from 'material-ui/Card';
import Button from 'material-ui/Button';
import Typography from 'material-ui/Typography';

const styles = {
  root: {
    padding: 40,
    margin: '0 auto',
    marginTop: 64,
    maxWidth: 600,
    minWidth: 320
  },
  deleteButton: {
    color: 'white',
    backgroundColor: 'red'
  }
};

export default class Footer extends Component {
  componentWillMount() {
    this.props.updatePageTitle();
  }

  render() {
    return (
      <div style={styles.root}>
        <Card>
          <CardContent>
            <Typography type='headline' component='h2' gutterBottom>
              Delete Account
            </Typography>
            <Typography component='p'>
              This cannot be undone. Really.
            </Typography>
          </CardContent>
          <CardActions>
            <Button
              raised
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
