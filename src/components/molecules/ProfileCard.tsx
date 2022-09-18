import { memo, useCallback, useContext } from 'react';
import { useMappedState } from 'redux-react-hook';
import ProfileAvatar from './ProfileAvatar';
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
import { useLocale } from '../../hooks/useLocale';

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
  const { I18n } = useLocale();

  return (
    <Link href="/profile" passHref>
      <ButtonBase>
        <CardContent className={classes.cardContent}>
          <ProfileAvatar size={48} profile={profile} />
          <Typography variant="h6" gutterBottom className={classes.name}>
            {currentUser.isAnonymous || !profile
              ? I18n.t('anonymous user')
              : profile.name}
          </Typography>
        </CardContent>
      </ButtonBase>
    </Link>
  );
});
