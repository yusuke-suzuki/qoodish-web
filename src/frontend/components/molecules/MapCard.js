import React from 'react';
import Link from '../molecules/Link';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import ButtonBase from '@material-ui/core/ButtonBase';
import FollowMapButton from '../molecules/FollowMapButton';

const styles = {
  mapImage: {
    width: '100%',
    height: 120,
    objectFit: 'cover'
  },
  cardContent: {
    padding: 0,
    marginBottom: 24
  }
};

const MapCard = props => {
  const map = props.map;

  return (
    <CardContent style={styles.cardContent}>
      <ButtonBase component={Link} to={`/maps/${map.id}`} title={map.name}>
        <CardMedia>
          <img src={map.image_url} alt={map.name} style={styles.mapImage} />
        </CardMedia>
      </ButtonBase>
      <Typography variant="subtitle1" noWrap>
        {map.name}
      </Typography>
      <Typography variant="subtitle2" color="textSecondary" noWrap>
        {map.owner_name}
      </Typography>
      <Typography variant="subtitle2" color="textSecondary" gutterBottom noWrap>
        {map.description}
      </Typography>
      <FollowMapButton currentMap={map} />
    </CardContent>
  );
};

export default React.memo(MapCard);
