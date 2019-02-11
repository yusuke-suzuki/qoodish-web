import React from 'react';
import loadable from '@loadable/component';

const Toast = loadable(() =>
  import(/* webpackChunkName: "toast" */ './molecules/Toast')
);
const BlockUi = loadable(() =>
  import(/* webpackChunkName: "block_ui" */ './molecules/BlockUi')
);
const IssueDialog = loadable(() =>
  import(/* webpackChunkName: "issue_dialog" */ './organisms/IssueDialog')
);
const LikesDialog = loadable(() =>
  import(/* webpackChunkName: "likes_dialog" */ './organisms/LikesDialog')
);
const CopyReviewDialog = loadable(() =>
  import(/* webpackChunkName: "copy_reviews_dialog" */ './organisms/CopyReviewDialog')
);
const FeedbackDialog = loadable(() =>
  import(/* webpackChunkName: "feedback_dialog" */ './organisms/FeedbackDialog')
);
const SignInRequiredDialog = loadable(() =>
  import(/* webpackChunkName: "sign_in_required_dialog" */ './organisms/SignInRequiredDialog')
);
const ReviewDialog = loadable(() =>
  import(/* webpackChunkName: "review_dialog" */ './organisms/ReviewDialog')
);
const SpotDialog = loadable(() =>
  import(/* webpackChunkName: "spot_dialog" */ './organisms/SpotDialog')
);
const DeleteReviewDialog = loadable(() =>
  import(/* webpackChunkName: "delete_review_dialog" */ './organisms/DeleteReviewDialog')
);
const DeleteCommentDialog = loadable(() =>
  import(/* webpackChunkName: "delete_comment_dialog" */ './organisms/DeleteCommentDialog')
);
const PlaceSelectDialog = loadable(() =>
  import(/* webpackChunkName: "place_select_dialog" */ './organisms/PlaceSelectDialog')
);
const BaseSelectDialog = loadable(() =>
  import(/* webpackChunkName: "base_select_dialog" */ './organisms/BaseSelectDialog')
);
const EditReviewDialog = loadable(() =>
  import(/* webpackChunkName: "edit_review_dialog" */ './organisms/EditReviewDialog')
);
const CreateMapDialog = loadable(() =>
  import(/* webpackChunkName: "create_map_dialog" */ './organisms/CreateMapDialog')
);
const EditMapDialog = loadable(() =>
  import(/* webpackChunkName: "edit_map_dialog" */ './organisms/EditMapDialog')
);
const EditProfileDialog = loadable(() =>
  import(/* webpackChunkName: "edit_profile_dialog" */ './organisms/EditProfileDialog')
);
const SearchMapsDialog = loadable(() =>
  import(/* webpackChunkName: "search_maps_dialog" */ './organisms/SearchMapsDialog')
);
const CreateActions = loadable(() =>
  import(/* webpackChunkName: "create_actions" */ './organisms/CreateActions')
);
const FollowingMapsDialog = loadable(() =>
  import(/* webpackChunkName: "following_maps_dialog" */ './organisms/FollowingMapsDialog')
);
const LeaveMapDialog = loadable(() =>
  import(/* webpackChunkName: "leave_map_dialog" */ './organisms/LeaveMapDialog')
);

const SharedDialogs = () => {
  return (
    <div>
      <Toast />
      <BlockUi />
      <FeedbackDialog />
      <SignInRequiredDialog />
      <IssueDialog />
      <LikesDialog />
      <CopyReviewDialog />
      <PlaceSelectDialog />
      <BaseSelectDialog />
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
    </div>
  );
};
export default SharedDialogs;
