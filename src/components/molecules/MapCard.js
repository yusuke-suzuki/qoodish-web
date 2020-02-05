import React from 'react';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Typography from '@material-ui/core/Typography';
import ButtonBase from '@material-ui/core/ButtonBase';
import LockIcon from '@material-ui/icons/Lock';

import { Link } from '@yusuke-suzuki/rize-router';
import FollowMapButton from '../molecules/FollowMapButton';
import I18n from '../../utils/I18n';

const styles = {
  card: {
    width: '100%'
  },
  mapImage: {
    width: '100%',
    height: 120,
    objectFit: 'cover'
  },
  cardContent: {
    paddingBottom: 8,
    paddingTop: 8
  },
  privateIcon: {
    fontSize: '1rem'
  },
  cardMedia: {
    width: '100%'
  },
  cardActions: {
    padding: 16,
    paddingTop: 0
  },
  buttonBase: {
    width: '100%'
  }
};

const MapCard = props => {
  const large = useMediaQuery('(min-width: 600px)');
  const { map } = props;

  return (
    <ButtonBase
      component={Link}
      to={`/maps/${map.id}`}
      title={map.name}
      style={styles.buttonBase}
    >
      <Card style={styles.card} elevation={0}>
        <CardMedia
          image={map.thumbnail_url_400}
          alt={map.name}
          style={styles.mapImage}
          loading="lazy"
        />
        <CardContent style={styles.cardContent}>
          <Typography variant="subtitle1" noWrap>
            {map.private && (
              <LockIcon style={styles.privateIcon} color="inherit" />
            )}{' '}
            {map.name}
          </Typography>
          <Typography variant="subtitle2" color="textSecondary" noWrap>
            {map.owner_name}
          </Typography>
          <Typography
            variant="subtitle2"
            color="textSecondary"
            gutterBottom
            noWrap
          >
            {map.description}
          </Typography>
          <Typography
            variant="subtitle2"
            color="textSecondary"
            gutterBottom
            noWrap
          >
            {map.followers_count} {I18n.t('followers')}
          </Typography>
        </CardContent>
        <CardActions style={styles.cardActions}>
          <FollowMapButton currentMap={map} />
        </CardActions>
      </Card>
    </ButtonBase>
  );
};

export default React.memo(MapCard);
