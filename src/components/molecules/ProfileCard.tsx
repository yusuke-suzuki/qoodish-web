import { memo, useCallback, useContext } from 'react';
import { useMappedState } from 'redux-react-hook';
import ProfileAvatar from './ProfileAvatar';
import I18n from '../../utils/I18n';
import Link from 'next/link';
import AuthContext from '../../context/AuthContext';
import {
  ButtonBase,
  CardContent,
  createStyles,
  makeStyles,
  Theme,
  Typography
} from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    cardContent: {
      paddingBottom: 0
    },
    name: {
      marginTop: theme.spacing(2)
    }
  })
);

export default memo(function ProfileCard() {
  const profile = useMappedState(useCallback(state => state.app.profile, []));

  const { currentUser } = useContext(AuthContext);
  const classes = useStyles();

  return (
    <Link href="/profile" passHref>
      <ButtonBase>
        <CardContent className={classes.cardContent}>
          <ProfileAvatar size={48} profile={profile} />
          <Typography variant="h6" gutterBottom className={classes.name}>
            {currentUser.isAnonymous ? I18n.t('anonymous user') : profile.name}
          </Typography>
        </CardContent>
      </ButtonBase>
    </Link>
  );
});
