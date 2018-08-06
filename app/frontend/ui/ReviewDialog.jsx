import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Slide from '@material-ui/core/Slide';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import ReviewCardContainer from '../containers/ReviewCardContainer';
import I18n from '../containers/I18n';

const styles = {
  appbar: {
    position: 'relative'
  },
  toolbar: {
    paddingLeft: 8
  },
  flex: {
    flex: 1
  },
  dialogContent: {
    padding: 0
  }
};

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

class ReviewDialog extends React.Component {
  render() {
    return (
      <Dialog
        open={this.props.dialogOpen}
        onClose={this.props.handleRequestDialogClose}
        TransitionComponent={Transition}
        fullWidth
        fullScreen={this.props.large ? false : true}
      >
        {!this.props.large && this.renderAppBar()}
        <DialogContent style={styles.dialogContent}>
          <div>
            {this.props.currentReview &&
              this.renderReviewCard(this.props.currentReview)}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  renderAppBar() {
    return (
      <AppBar style={styles.appbar} color="primary">
        <Toolbar style={styles.toolbar}>
          <IconButton
            color="inherit"
            onClick={this.props.handleRequestDialogClose}
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="title" color="inherit" style={styles.flex}>
            {I18n.t('report')}
          </Typography>
        </Toolbar>
      </AppBar>
    );
  }

  renderReviewCard(review) {
    return (
      <ReviewCardContainer
        currentReview={review}
        detail={!this.props.large}
      />
    );
  }
}

export default ReviewDialog;
