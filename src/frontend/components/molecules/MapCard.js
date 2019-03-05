import React from 'react';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';

import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import ButtonBase from '@material-ui/core/ButtonBase';
import LockIcon from '@material-ui/icons/Lock';

import Link from '../molecules/Link';
import FollowMapButton from '../molecules/FollowMapButton';
import I18n from '../../utils/I18n';

const styles = {
  mapImage: {
    width: '100%',
    height: 120,
    objectFit: 'cover'
  },
  cardContent: {
    padding: 0,
    marginBottom: 24
  },
  privateIcon: {
    fontSize: '1rem'
  },
  cardMedia: {
    width: '100%'
  },
  buttonBase: {
    width: '100%'
  }
};

const MapCard = props => {
  const large = useMediaQuery('(min-width: 600px)');
  const map = props.map;

  return (
    <CardContent style={styles.cardContent}>
      <ButtonBase
        component={Link}
        to={`/maps/${map.id}`}
        title={map.name}
        style={styles.buttonBase}
      >
        <CardMedia style={styles.cardMedia}>
          <img
            src={large ? map.image_url : map.thumbnail_url}
            alt={map.name}
            style={styles.mapImage}
          />
        </CardMedia>
      </ButtonBase>
      <Typography variant="subtitle1" noWrap>
        {map.private && <LockIcon style={styles.privateIcon} color="inherit" />}{' '}
        {map.name}
      </Typography>
      <Typography variant="subtitle2" color="textSecondary" noWrap>
        {map.owner_name}
      </Typography>
      <Typography variant="subtitle2" color="textSecondary" gutterBottom noWrap>
        {map.description}
      </Typography>
      <Typography variant="subtitle2" color="textSecondary" gutterBottom noWrap>
        {map.followers_count} {I18n.t('followers')}
      </Typography>
      <FollowMapButton currentMap={map} />
    </CardContent>
  );
};

export default React.memo(MapCard);
