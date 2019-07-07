import React from 'react';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';

import MapCard from '../molecules/MapCard';

const styles = {
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around'
  },
  gridList: {
    width: '100%'
  },
  gridListHorizontal: {
    flexWrap: 'nowrap',
    transform: 'translateZ(0)',
    width: '100%'
  },
  gridTile: {
    textDecoration: 'none'
  }
};

const MapCollection = props => {
  const large = useMediaQuery('(min-width: 600px)');

  return (
    <div style={styles.container}>
      <GridList
        cols={large ? 3 : props.horizontal ? 1.5 : 2}
        style={props.horizontal ? styles.gridListHorizontal : styles.gridList}
        spacing={large || props.horizontal ? 20 : 10}
        cellHeight={300}
      >
        {props.maps.map(map => (
          <GridListTile key={map.id} style={styles.gridTile}>
            <MapCard map={map} />
          </GridListTile>
        ))}
      </GridList>
    </div>
  );
};

export default React.memo(MapCollection);
