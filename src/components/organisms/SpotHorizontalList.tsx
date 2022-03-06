import React, { useCallback } from 'react';
import { useMappedState } from 'redux-react-hook';
import {
  GridList,
  GridListTile,
  GridListTileBar,
  useMediaQuery,
  makeStyles,
  useTheme
} from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import SpotTile from '../molecules/SpotTile';

const useStyles = makeStyles({
  root: {
    position: 'fixed',
    bottom: 0,
    width: '100%',
    height: 124,
    background: 'rgba(0, 0, 0, 0.1)'
  },
  container: {
    padding: 12
  },
  gridList: {
    flexWrap: 'nowrap',
    transform: 'translateZ(0)'
  },
  tileBar: {
    height: '50%'
  },
  reviewerContainer: {
    display: 'flex',
    position: 'absolute',
    zIndex: 1,
    right: 18,
    top: 8
  },
  skeletonAvatar: {
    width: 24,
    height: 24,
    marginRight: -10.66666667,
    float: 'right'
  }
});

const SpotHorizontalList = () => {
  const mapState = useCallback(
    state => ({
      spots: state.gMap.spots
    }),
    []
  );

  const { spots } = useMappedState(mapState);

  const classes = useStyles();
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));

  return (
    <div className={classes.root}>
      <div className={classes.container}>
        <GridList
          spacing={12}
          cols={smUp ? 4.5 : 2.5}
          cellHeight={100}
          className={classes.gridList}
        >
          {spots.length < 1
            ? Array.from(new Array(3)).map((v, i) => (
                <GridListTile key={i}>
                  <div className={classes.reviewerContainer}>
                    <Skeleton
                      variant="circle"
                      className={classes.skeletonAvatar}
                    />
                  </div>
                  <Skeleton variant="rect" height={100} />
                  <GridListTileBar
                    className={classes.tileBar}
                    title={<Skeleton height={16} width="100%" />}
                    subtitle={<Skeleton height={16} width="80%" />}
                  />
                </GridListTile>
              ))
            : spots.map(spot => (
                <GridListTile key={spot.id}>
                  <SpotTile key={spot.place_id} spot={spot} />
                </GridListTile>
              ))}
        </GridList>
      </div>
    </div>
  );
};

export default React.memo(SpotHorizontalList);
