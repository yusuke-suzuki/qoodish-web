import { memo, useCallback, useContext } from 'react';
import { useDispatch } from 'redux-react-hook';
import Link from 'next/link';
import openCreateMapDialog from '../../actions/openCreateMapDialog';
import openSignInRequiredDialog from '../../actions/openSignInRequiredDialog';
import AuthContext from '../../context/AuthContext';
import {
  Button,
  createStyles,
  makeStyles,
  Theme,
  Typography
} from '@material-ui/core';
import {
  Add,
  Edit,
  Mail,
  Map,
  Notifications,
  Place,
  RateReview,
  Search,
  ThumbUp
} from '@material-ui/icons';
import openEditReviewDialog from '../../actions/openEditReviewDialog';
import { useLocale } from '../../hooks/useLocale';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      textAlign: 'center',
      color: theme.palette.text.hint,
      padding: theme.spacing(3)
    },
    icon: {
      width: theme.spacing(12),
      height: theme.spacing(12)
    }
  })
);

type ActionProps = {
  actionType: string;
};

const PrimaryAction = memo((props: ActionProps) => {
  const { actionType } = props;
  const { currentUser } = useContext(AuthContext);
  const dispatch = useDispatch();
  const { I18n } = useLocale();

  const handleCreateMapButtonClick = useCallback(() => {
    if (currentUser.isAnonymous) {
      dispatch(openSignInRequiredDialog());
    } else {
      dispatch(openCreateMapDialog());
    }
  }, [dispatch, currentUser]);

  const handleCreateReviewButtonClick = useCallback(() => {
    if (currentUser.isAnonymous) {
      dispatch(openSignInRequiredDialog());
    } else {
      dispatch(openEditReviewDialog(null));
    }
  }, [dispatch, currentUser]);

  switch (actionType) {
    case 'create-map':
      return (
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreateMapButtonClick}
          startIcon={<Add />}
        >
          {I18n.t('create new map')}
        </Button>
      );
    case 'create-review':
      return (
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreateReviewButtonClick}
          startIcon={<Edit />}
        >
          {I18n.t('create new report')}
        </Button>
      );
    case 'discover-reviews':
      return (
        <Link href="/discover" passHref>
          <Button color="primary" startIcon={<Search />}>
            {I18n.t('discover reviews')}
          </Button>
        </Link>
      );
    default:
      return null;
  }
});

const SecondaryAction = memo((props: ActionProps) => {
  const { actionType } = props;
  const { I18n } = useLocale();

  switch (actionType) {
    case 'discover-maps':
      return (
        <Link href="/discover" passHref>
          <Button color="primary" startIcon={<Search />}>
            {I18n.t('discover maps')}
          </Button>
        </Link>
      );
    case 'discover-reviews':
      return (
        <Link href="/discover" passHref>
          <Button color="primary" startIcon={<Search />}>
            {I18n.t('discover reviews')}
          </Button>
        </Link>
      );
    default:
      return null;
  }
});

type IconProps = {
  contentType: string;
};

const ContentsIcon = memo((props: IconProps) => {
  const classes = useStyles();
  const { contentType } = props;

  switch (contentType) {
    case 'map':
      return <Map className={classes.icon} />;
    case 'review':
      return <RateReview className={classes.icon} />;
    case 'notification':
      return <Notifications className={classes.icon} />;
    case 'like':
      return <ThumbUp className={classes.icon} />;
    case 'spot':
      return <Place className={classes.icon} />;
    case 'invite':
      return <Mail className={classes.icon} />;
    default:
      return null;
  }
});

type Props = {
  message: string;
  contentType: 'map' | 'review' | 'notification' | 'like' | 'spot' | 'invite';
  action?: 'create-map' | 'create-review' | 'discover-reviews';
  secondaryAction?: 'discover-maps' | 'discover-reviews';
};

export default memo(function NoContents(props: Props) {
  const classes = useStyles();
  const { message, contentType, action, secondaryAction } = props;

  return (
    <div className={classes.container}>
      <ContentsIcon contentType={contentType} />
      <Typography variant="subtitle1" color="inherit">
        {message}
      </Typography>
      {action && (
        <>
          <br />
          <div>
            <PrimaryAction actionType={action} />
          </div>
        </>
      )}
      {secondaryAction && (
        <>
          <br />
          <div>
            <SecondaryAction actionType={secondaryAction} />
          </div>
        </>
      )}
    </div>
  );
});
