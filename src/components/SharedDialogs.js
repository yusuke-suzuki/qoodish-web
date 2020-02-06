import React from 'react';

const Toast = React.lazy(() =>
  import(/* webpackChunkName: "toast" */ './molecules/Toast')
);
const BlockUi = React.lazy(() =>
  import(/* webpackChunkName: "block_ui" */ './molecules/BlockUi')
);
const IssueDialog = React.lazy(() =>
  import(/* webpackChunkName: "issue_dialog" */ './organisms/IssueDialog')
);
const LikesDialog = React.lazy(() =>
  import(/* webpackChunkName: "likes_dialog" */ './organisms/LikesDialog')
);
const CopyReviewDialog = React.lazy(() =>
  import(
    /* webpackChunkName: "copy_reviews_dialog" */ './organisms/CopyReviewDialog'
  )
);
const FeedbackDialog = React.lazy(() =>
  import(/* webpackChunkName: "feedback_dialog" */ './organisms/FeedbackDialog')
);
const AnnouncementDialog = React.lazy(() =>
  import(
    /* webpackChunkName: "announcement_dialog" */ './organisms/AnnouncementDialog'
  )
);
const SignInRequiredDialog = React.lazy(() =>
  import(
    /* webpackChunkName: "sign_in_required_dialog" */ './organisms/SignInRequiredDialog'
  )
);
const ReviewDialog = React.lazy(() =>
  import(/* webpackChunkName: "review_dialog" */ './organisms/ReviewDialog')
);
const ImageDialog = React.lazy(() =>
  import(/* webpackChunkName: "image_dialog" */ './organisms/ImageDialog')
);
const SpotDialog = React.lazy(() =>
  import(/* webpackChunkName: "spot_dialog" */ './organisms/SpotDialog')
);
const DeleteReviewDialog = React.lazy(() =>
  import(
    /* webpackChunkName: "delete_review_dialog" */ './organisms/DeleteReviewDialog'
  )
);
const DeleteCommentDialog = React.lazy(() =>
  import(
    /* webpackChunkName: "delete_comment_dialog" */ './organisms/DeleteCommentDialog'
  )
);
const PlaceSelectDialog = React.lazy(() =>
  import(
    /* webpackChunkName: "place_select_dialog" */ './organisms/PlaceSelectDialog'
  )
);
const BaseSelectDialog = React.lazy(() =>
  import(
    /* webpackChunkName: "base_select_dialog" */ './organisms/BaseSelectDialog'
  )
);
const EditReviewDialog = React.lazy(() =>
  import(
    /* webpackChunkName: "edit_review_dialog" */ './organisms/EditReviewDialog'
  )
);
const CreateMapDialog = React.lazy(() =>
  import(
    /* webpackChunkName: "create_map_dialog" */ './organisms/CreateMapDialog'
  )
);
const EditMapDialog = React.lazy(() =>
  import(/* webpackChunkName: "edit_map_dialog" */ './organisms/EditMapDialog')
);
const EditProfileDialog = React.lazy(() =>
  import(
    /* webpackChunkName: "edit_profile_dialog" */ './organisms/EditProfileDialog'
  )
);
const SearchMapsDialog = React.lazy(() =>
  import(
    /* webpackChunkName: "search_maps_dialog" */ './organisms/SearchMapsDialog'
  )
);
const CreateActions = React.lazy(() =>
  import(/* webpackChunkName: "create_actions" */ './organisms/CreateActions')
);
const FollowingMapsDialog = React.lazy(() =>
  import(
    /* webpackChunkName: "following_maps_dialog" */ './organisms/FollowingMapsDialog'
  )
);
const LeaveMapDialog = React.lazy(() =>
  import(
    /* webpackChunkName: "leave_map_dialog" */ './organisms/LeaveMapDialog'
  )
);

const SharedDialogs = () => {
  return (
    <React.Suspense fallback={null}>
      <Toast />
      <BlockUi />
      <FeedbackDialog />
      <AnnouncementDialog />
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
      <ImageDialog />
      <SpotDialog />
      <CreateMapDialog />
      <EditMapDialog />
      <EditProfileDialog />
      <SearchMapsDialog />
      <CreateActions />
      <FollowingMapsDialog />
      <LeaveMapDialog />
    </React.Suspense>
  );
};
export default SharedDialogs;
