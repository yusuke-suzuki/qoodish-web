import {
  Button,
  Card,
  CardActions,
  CardContent,
  makeStyles,
  Typography
} from '@material-ui/core';
import { memo, useCallback, useContext } from 'react';
import { useDispatch } from 'redux-react-hook';
import openDeleteAccountDialog from '../../actions/openDeleteAccountDialog';
import AuthContext from '../../context/AuthContext';
import { useLocale } from '../../hooks/useLocale';

const useStyles = makeStyles({
  deleteButton: {
    color: 'white',
    backgroundColor: 'red'
  }
});

const DeleteAccountCard = () => {
  const dispatch = useDispatch();
  const classes = useStyles();
  const { I18n } = useLocale();

  const { currentUser } = useContext(AuthContext);

  const handleDeleteAccountButtonClick = useCallback(async () => {
    dispatch(openDeleteAccountDialog());
  }, [dispatch]);

  return (
    <Card elevation={0}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          {I18n.t('delete account')}
        </Typography>
        <Typography component="p">{I18n.t('this cannot be undone')}</Typography>
      </CardContent>
      <CardActions>
        <Button
          variant="contained"
          onClick={handleDeleteAccountButtonClick}
          className={
            currentUser && currentUser.isAnonymous ? '' : classes.deleteButton
          }
          disabled={currentUser && currentUser.isAnonymous}
        >
          {I18n.t('delete account')}
        </Button>
      </CardActions>
    </Card>
  );
};

export default memo(DeleteAccountCard);
