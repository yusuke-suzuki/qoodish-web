import React from 'react';

import ToastContainer from '../containers/ToastContainer';
import BlockUiContainer from '../containers/BlockUiContainer';
import IssueDialogContainer from '../containers/IssueDialogContainer';
import LikesDialogContainer from '../containers/LikesDialogContainer';
import CopyReviewDialogContainer from '../containers/CopyReviewDialogContainer';
import FeedbackDialogContainer from '../containers/FeedbackDialogContainer';
import SignInRequiredDialogContainer from '../containers/SignInRequiredDialogContainer';
import RequestNotificationDialogContainer from '../containers/RequestNotificationDialogContainer';
import ReviewDialogContainer from '../containers/ReviewDialogContainer';
import DeleteReviewDialogContainer from '../containers/DeleteReviewDialogContainer';
import PlaceSelectDialogContainer from '../containers/PlaceSelectDialogContainer';
import BaseSelectDialogContainer from '../containers/BaseSelectDialogContainer';
import EditReviewDialogContainer from '../containers/EditReviewDialogContainer';
import CreateMapDialogContainer from '../containers/CreateMapDialogContainer.js';
import EditMapDialogContainer from '../containers/EditMapDialogContainer';
import EditProfileDialogContainer from '../containers/EditProfileDialogContainer';

export default class SharedDialogs extends React.PureComponent {
  render() {
    return (
      <div>
        <FeedbackDialogContainer />
        <SignInRequiredDialogContainer />
        <RequestNotificationDialogContainer />
        <ToastContainer />
        <BlockUiContainer />
        <IssueDialogContainer />
        <LikesDialogContainer />
        <CopyReviewDialogContainer />
        <PlaceSelectDialogContainer />
        <BaseSelectDialogContainer />
        <EditReviewDialogContainer />
        <DeleteReviewDialogContainer />
        <ReviewDialogContainer />
        <CreateMapDialogContainer />
        <EditMapDialogContainer />
        <EditProfileDialogContainer />
      </div>
    );
  }
}
