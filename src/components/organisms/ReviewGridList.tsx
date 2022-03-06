import React from 'react';

import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import { createStyles, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-around'
    },
    gridList: {
      width: '100%'
    }
  })
);

type Props = {
  cols: any;
  spacing: any;
  cellHeight: any;
  children: any;
};

const ReviewGridList = (props: Props) => {
  const { cols, spacing, cellHeight, children } = props;
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <GridList
        className={classes.gridList}
        cols={cols}
        spacing={spacing}
        cellHeight={cellHeight}
      >
        {children.map(child => (
          <GridListTile key={child.key}>{child}</GridListTile>
        ))}
      </GridList>
    </div>
  );
};

ReviewGridList.defaultProps = {
  cols: 3,
  spacing: 4,
  cellHeight: 100
};

export default React.memo(ReviewGridList);
