import { memo, useCallback, useContext } from 'react';
import { useDispatch } from 'redux-react-hook';
import openSignInRequiredDialog from '../../actions/openSignInRequiredDialog';
import openCreateActions from '../../actions/openCreateActions';
import AuthContext from '../../context/AuthContext';
import { Fab, makeStyles } from '@material-ui/core';
import { Add } from '@material-ui/icons';
import openEditReviewDialog from '../../actions/openEditReviewDialog';

const useStyles = makeStyles({
  disabled: {
    color: 'rgba(0, 0, 0, 0.26)',
    boxShadow: 'none',
    backgroundColor: 'rgba(0, 0, 0, 0.12)'
  }
});

type Props = {
  defaultCreateReview?: boolean;
  disabled?: boolean;
};

export default memo(function CreateResourceButton(props: Props) {
  const { defaultCreateReview, disabled } = props;
  const { currentUser } = useContext(AuthContext);
  const dispatch = useDispatch();
  const classes = useStyles();

  const handleButtonClick = useCallback(() => {
    if (currentUser.isAnonymous) {
      dispatch(openSignInRequiredDialog());
    } else if (defaultCreateReview) {
      dispatch(openEditReviewDialog(null));
    } else {
      dispatch(openCreateActions());
    }
  }, [dispatch, currentUser, defaultCreateReview]);

  return (
    <Fab
      className={disabled ? classes.disabled : ''}
      onClick={handleButtonClick}
      disabled={disabled}
      data-test="create-resource-button"
      color="primary"
    >
      <Add />
    </Fab>
  );
});
