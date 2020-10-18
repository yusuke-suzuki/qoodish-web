import React, { Fragment } from 'react';
import BlockUi from './molecules/BlockUi';
import Toast from './molecules/Toast';
import CreateActions from './organisms/CreateActions';
import CreateMapDialog from './organisms/CreateMapDialog';
import DeleteCommentDialog from './organisms/DeleteCommentDialog';
import DeleteReviewDialog from './organisms/DeleteReviewDialog';
import EditMapDialog from './organisms/EditMapDialog';
import EditProfileDialog from './organisms/EditProfileDialog';
import EditReviewDialog from './organisms/EditReviewDialog';
import FollowersDialog from './organisms/FollowersDialog';
import FollowingMapsDialog from './organisms/FollowingMapsDialog';
import IssueDialog from './organisms/IssueDialog';
import LeaveMapDialog from './organisms/LeaveMapDialog';
import LikesDialog from './organisms/LikesDialog';
import ReviewDialog from './organisms/ReviewDialog';
import SearchMapsDialog from './organisms/SearchMapsDialog';
import SignInRequiredDialog from './organisms/SignInRequiredDialog';
import SpotDialog from './organisms/SpotDialog';

const SharedDialogs = () => {
  return (
    <Fragment>
      <Toast />
      <BlockUi />
      <SignInRequiredDialog />
      <IssueDialog />
      <LikesDialog />
      <FollowersDialog />
      <EditReviewDialog />
      <DeleteReviewDialog />
      <DeleteCommentDialog />
      <ReviewDialog />
      <SpotDialog />
      <CreateMapDialog />
      <EditMapDialog />
      <EditProfileDialog />
      <SearchMapsDialog />
      <CreateActions />
      <FollowingMapsDialog />
      <LeaveMapDialog />
    </Fragment>
  );
};
export default SharedDialogs;
