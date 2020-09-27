import React, { useCallback, useContext } from 'react';
import { useMappedState } from 'redux-react-hook';

import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import ButtonBase from '@material-ui/core/ButtonBase';

import ProfileAvatar from './ProfileAvatar';
import I18n from '../../utils/I18n';
import { Link } from '@yusuke-suzuki/rize-router';
import AuthContext from '../../context/AuthContext';

const styles = {
  cardContent: {
    paddingBottom: 0
  },
  name: {
    marginTop: 8
  }
};

const ProfileCard = () => {
  const profile = useMappedState(useCallback(state => state.app.profile, []));

  const { currentUser } = useContext(AuthContext);

  return (
    <ButtonBase component={Link} to="/profile">
      <CardContent style={styles.cardContent}>
        <ProfileAvatar size={48} profile={profile} />
        <Typography variant="h6" gutterBottom style={styles.name} inline>
          {currentUser.isAnonymous ? I18n.t('anonymous user') : profile.name}
        </Typography>
      </CardContent>
    </ButtonBase>
  );
};

export default React.memo(ProfileCard);
