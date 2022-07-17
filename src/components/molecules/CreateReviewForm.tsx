import React, { memo, useCallback, useContext } from 'react';
import { useDispatch, useMappedState } from 'redux-react-hook';
import openSignInRequiredDialog from '../../actions/openSignInRequiredDialog';
import ProfileAvatar from './ProfileAvatar';
import AuthContext from '../../context/AuthContext';
import {
  Card,
  CardHeader,
  createStyles,
  makeStyles,
  Typography
} from '@material-ui/core';
import openEditReviewDialog from '../../actions/openEditReviewDialog';
import { useLocale } from '../../hooks/useLocale';

const useStyles = makeStyles(() =>
  createStyles({
    formCard: {
      cursor: 'pointer'
    }
  })
);

export default memo(function CreateReviewForm() {
  const dispatch = useDispatch();
  const { currentUser } = useContext(AuthContext);
  const classes = useStyles();
  const { I18n } = useLocale();

  const mapState = useCallback(
    state => ({
      profile: state.app.profile
    }),
    []
  );
  const { profile } = useMappedState(mapState);

  const handleCreateReviewClick = useCallback(() => {
    if (!currentUser || currentUser.isAnonymous) {
      dispatch(openSignInRequiredDialog());
      return;
    }
    dispatch(openEditReviewDialog(null));
  }, [dispatch, currentUser]);

  return (
    <Card
      className={classes.formCard}
      onClick={handleCreateReviewClick}
      elevation={0}
    >
      <CardHeader
        avatar={<ProfileAvatar profile={profile} />}
        title={
          <Typography variant="body1" color="textSecondary">
            {I18n.t('share recent spot')}
          </Typography>
        }
      />
    </Card>
  );
});
