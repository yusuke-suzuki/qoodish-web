import React, { useCallback } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import Typography from '@material-ui/core/Typography';
import openPlaceSelectDialog from '../../actions/openPlaceSelectDialog';
import openSignInRequiredDialog from '../../actions/openSignInRequiredDialog';
import I18n from '../../utils/I18n';
import ProfileAvatar from './ProfileAvatar';

const styles = {
  formCard: {
    cursor: 'pointer'
  }
};

const CreateReviewForm = () => {
  const dispatch = useDispatch();
  const mapState = useCallback(
    state => ({
      currentUser: state.app.currentUser
    }),
    []
  );
  const { currentUser } = useMappedState(mapState);

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
        avatar={<ProfileAvatar currentUser={currentUser} />}
        title={
          <Typography variant="body1" color="textSecondary">
            {I18n.t('share recent spot')}
          </Typography>
        }
      />
    </Card>
  );
};

export default React.memo(CreateReviewForm);
