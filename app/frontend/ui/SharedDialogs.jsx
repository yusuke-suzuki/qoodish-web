import React from 'react';
import loadable from '@loadable/component';

const ToastContainer = loadable(() => import(/* webpackChunkName: "toast" */ '../containers/ToastContainer'));
const BlockUiContainer = loadable(() => import(/* webpackChunkName: "block_ui" */ '../containers/BlockUiContainer'));
const IssueDialogContainer = loadable(() => import(/* webpackChunkName: "issue_dialog" */ '../containers/IssueDialogContainer'));
const LikesDialogContainer = loadable(() => import(/* webpackChunkName: "likes_dialog" */ '../containers/LikesDialogContainer'));
const CopyReviewDialogContainer = loadable(() => import(/* webpackChunkName: "copy_reviews_dialog" */ '../containers/CopyReviewDialogContainer'));
const FeedbackDialogContainer = loadable(() => import(/* webpackChunkName: "feedback_dialog" */ '../containers/FeedbackDialogContainer'));
const SignInRequiredDialogContainer = loadable(() => import(/* webpackChunkName: "sign_in_required_dialog" */ '../containers/SignInRequiredDialogContainer'));
const ReviewDialogContainer = loadable(() => import(/* webpackChunkName: "review_dialog" */ '../containers/ReviewDialogContainer'));
const DeleteReviewDialogContainer = loadable(() => import(/* webpackChunkName: "delete_review_dialog" */ '../containers/DeleteReviewDialogContainer'));
const PlaceSelectDialogContainer = loadable(() => import(/* webpackChunkName: "place_select_dialog" */ '../containers/PlaceSelectDialogContainer'));
const BaseSelectDialogContainer = loadable(() => import(/* webpackChunkName: "base_select_dialog" */ '../containers/BaseSelectDialogContainer'));
const EditReviewDialogContainer = loadable(() => import(/* webpackChunkName: "edit_review_dialog" */ '../containers/EditReviewDialogContainer'));
const CreateMapDialogContainer = loadable(() => import(/* webpackChunkName: "create_map_dialog" */ '../containers/CreateMapDialogContainer'));
const EditMapDialogContainer = loadable(() => import(/* webpackChunkName: "edit_map_dialog" */ '../containers/EditMapDialogContainer'));
const EditProfileDialogContainer = loadable(() => import(/* webpackChunkName: "edit_profile_dialog" */ '../containers/EditProfileDialogContainer'));
const SearchMapsDialogContainer = loadable(() => import(/* webpackChunkName: "search_maps_dialog" */ '../containers/SearchMapsDialogContainer'));

const SharedDialogs = () => {
  return (
    <div>
      <ToastContainer />
      <BlockUiContainer />
      <FeedbackDialogContainer />
      <SignInRequiredDialogContainer />
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
      <SearchMapsDialogContainer />
    </div>
  );
}
 export default SharedDialogs;
