import React, { Component } from 'react';
import Dialog from 'material-ui/Dialog';
import Button from 'material-ui/Button';
import Slide from 'material-ui/transitions/Slide';
import ReviewCardContainer from '../containers/ReviewCardContainer';

const styles = {};

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

class ReviewDialog extends Component {
  componentWillUnmount() {
    this.props.handleRequestDialogClose();
  }

  render() {
    return (
      <Dialog
        open={this.props.dialogOpen}
        onClose={this.props.handleRequestDialogClose}
        transition={Transition}
        fullWidth
        fullScreen={this.props.large ? false : true}
      >
        <div>
          {this.props.currentReview &&
            this.renderReviewCard(this.props.currentReview)}
        </div>
      </Dialog>
    );
  }

  renderReviewCard(review) {
    return <ReviewCardContainer currentReview={review} />;
  }
}

export default ReviewDialog;
