import React, { useCallback } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import ListSubheader from '@material-ui/core/ListSubheader';
import I18n from '../../utils/I18n';

import requestMapCenter from '../../actions/requestMapCenter';
import selectSpot from '../../actions/selectSpot';
import openSpotCard from '../../actions/openSpotCard';

const styles = {
  subheader: {
    height: 36
  }
};

const MapSpotsList = () => {
  const dispatch = useDispatch();
  const large = useMediaQuery('(min-width: 600px)');
  const spots = useMappedState(useCallback(state => state.gMap.spots, []));

  const handleSpotClick = useCallback(spot => {
    dispatch(requestMapCenter(spot.lat, spot.lng));
    dispatch(selectSpot(spot));
    dispatch(openSpotCard());
  });

  return (
    <List
      subheader={
        large && (
          <ListSubheader style={styles.subheader}>
            {I18n.t('spots')}
          </ListSubheader>
        )
      }
    >
      {spots.map(spot => (
        <ListItem
          button
          key={spot.place_id}
          onClick={() => handleSpotClick(spot)}
        >
          <Avatar src={spot.image_url} alt={spot.name} />
          <ListItemText
            disableTypography={true}
            primary={
              <Typography variant="subtitle1" noWrap>
                {spot.name}
              </Typography>
            }
            secondary={
              <Typography component="p" noWrap color="textSecondary">
                {spot.formatted_address}
              </Typography>
            }
          />
        </ListItem>
      ))}
    </List>
  );
};

export default React.memo(MapSpotsList);
