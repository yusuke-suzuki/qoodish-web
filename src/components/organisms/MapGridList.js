import React, { useMemo } from 'react';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';

const styles = {
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

const MapGridList = props => {
  const { horizontal } = props;
  const large = useMediaQuery('(min-width: 600px)');

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
    <GridList
      cols={cols}
      style={horizontal ? styles.gridListHorizontal : styles.gridList}
      spacing={large || horizontal ? 20 : 10}
      cellHeight={290}
    >
      {props.children.map(child => (
        <GridListTile key={child.key} style={styles.gridTile}>
          {child}
        </GridListTile>
      ))}
    </GridList>
  );
};

export default React.memo(MapGridList);
