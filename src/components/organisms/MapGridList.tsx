import React, { useMemo } from 'react';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import { useTheme } from '@material-ui/core';

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
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));

  const cols = useMemo(() => {
    if (smUp) {
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
  }, [smUp, horizontal]);

  return (
    <GridList
      cols={cols}
      style={horizontal ? styles.gridListHorizontal : styles.gridList}
      spacing={smUp || horizontal ? 20 : 10}
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
