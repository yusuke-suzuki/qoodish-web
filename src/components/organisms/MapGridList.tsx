import React, { useMemo } from 'react';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import { createStyles, makeStyles, useTheme } from '@material-ui/core';

const useStyles = makeStyles(() =>
  createStyles({
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
  })
);

type Props = {
  children: any;
  horizontal?: boolean;
};

const MapGridList = (props: Props) => {
  const { children, horizontal } = props;
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));
  const classes = useStyles();

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
      className={horizontal ? classes.gridListHorizontal : classes.gridList}
      spacing={smUp || horizontal ? 20 : 10}
      cellHeight={290}
    >
      {children.map(child => (
        <GridListTile key={child.key} className={classes.gridTile}>
          {child}
        </GridListTile>
      ))}
    </GridList>
  );
};

export default React.memo(MapGridList);
