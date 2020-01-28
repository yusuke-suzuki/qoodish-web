import React from 'react';

import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';

const styles = {
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around'
  },
  gridList: {
    width: '100%'
  }
};

const ReviewGridList = props => {
  const { cols, spacing, cellHeight } = props;

  return (
    <div style={styles.container}>
      <GridList
        style={styles.gridList}
        cols={cols}
        spacing={spacing}
        cellHeight={cellHeight}
      >
        {props.children.map(child => (
          <GridListTile>{child}</GridListTile>
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
