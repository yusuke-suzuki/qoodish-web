import React, { useMemo } from 'react';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';

import MapCard from '../molecules/MapCard';
import SkeletonMapCard from '../molecules/SkeletonMapCard';

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

  const { maps, horizontal, skeletonSize } = props;

  const cols = useMemo(() => {
    if (large) {
      if (horizontal) {
        return 2.5;
      } else {
        return 3;
      }
    } else {
      if (horizontal) {
        return 1.5;
      } else {
        return 2;
      }
    }
  }, [large, horizontal]);

  return (
    <div style={styles.container}>
      <GridList
        cols={cols}
        style={horizontal ? styles.gridListHorizontal : styles.gridList}
        spacing={large || horizontal ? 20 : 10}
        cellHeight={300}
      >
        {maps.length > 0
          ? maps.map(map => (
              <GridListTile key={map.id} style={styles.gridTile}>
                <MapCard map={map} />
              </GridListTile>
            ))
          : Array.from(new Array(skeletonSize || 4)).map((v, i) => (
              <GridListTile key={i} style={styles.gridTile}>
                <SkeletonMapCard />
              </GridListTile>
            ))}
      </GridList>
    </div>
  );
};

export default React.memo(MapCollection);
