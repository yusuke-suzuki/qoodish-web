import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import ReviewCard from '../ui/ReviewCard';
import openEditReviewDialog from '../actions/openEditReviewDialog';
import openDeleteReviewDialog from '../actions/openDeleteReviewDialog';
import openToast from '../actions/openToast';
import openIssueDialog from '../actions/openIssueDialog';

const mapStateToProps = (state) => {
  return {
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    handleMapClick: () => {
      dispatch(push(`/maps/${ownProps.currentReview.map_id}`));
    },

    handleTweetButtonClick: (review) => {
      let url = `${process.env.ENDPOINT}/maps/${review.map_id}/reports/${review.id}`;
      let text = `「${review.map_name}」にレポートを投稿しました。`;
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`);
    },

    handleFacebookButtonClick: (review) => {
      let url = `${process.env.ENDPOINT}/maps/${review.map_id}/reports/${review.id}`;
      window.open(`https://www.facebook.com/dialog/share?app_id=${process.env.FB_APP_ID}&href=${url}`);
    },

    handleUrlCopied: () => {
      dispatch(openToast('Copied!'));
    },

    handleEditReviewButtonClick: (review) => {
      dispatch(openEditReviewDialog(review));
    },

    handleDeleteReviewButtonClick: (review) => {
      dispatch(openDeleteReviewDialog(review));
    },

    handleIssueButtonClick: (review) => {
      dispatch(openIssueDialog(review.id, 'review'))
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReviewCard);
