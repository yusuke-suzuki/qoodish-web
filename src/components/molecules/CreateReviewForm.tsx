import React, { memo, useCallback, useContext } from 'react';
import { useDispatch, useMappedState } from 'redux-react-hook';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import Typography from '@material-ui/core/Typography';
import openPlaceSelectDialog from '../../actions/openPlaceSelectDialog';
import openSignInRequiredDialog from '../../actions/openSignInRequiredDialog';
import I18n from '../../utils/I18n';
import ProfileAvatar from './ProfileAvatar';
import AuthContext from '../../context/AuthContext';

const styles = {
  formCard: {
    cursor: 'pointer'
  }
};

export default memo(function CreateReviewForm() {
  const dispatch = useDispatch();
  const { currentUser } = useContext(AuthContext);

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
    dispatch(openPlaceSelectDialog());
  }, [dispatch, currentUser]);

  return (
    <Card
      style={styles.formCard}
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
