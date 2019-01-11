import React from 'react';
import { connect } from 'react-redux';
import ReviewComments from './ReviewComments';
import openDeleteCommentDialog from '../../../actions/openDeleteCommentDialog';

const mapStateToProps = state => {
  return {};
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    handleDeleteCommentButtonClick: async comment => {
      dispatch(openDeleteCommentDialog(comment));
    }
  };
};

export default React.memo(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(ReviewComments)
);
