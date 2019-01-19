import React, { useCallback } from 'react';
import { useDispatch } from 'redux-react-hook';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';

import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import Typography from '@material-ui/core/Typography';
import PlaceIcon from '@material-ui/icons/Place';

import I18n from '../../utils/I18n';
import openReviewDialog from '../../actions/openReviewDialog';

const styles = {
  gridContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around'
  },
  gridList: {
    width: '100%'
  },
  gridTile: {
    cursor: 'pointer'
  },
  tileBar: {
    height: '100%',
    textAlign: 'center'
  },
  placeIconLarge: {
    fontSize: 64
  },
  placeIconSmall: {
    fontSize: 36
  }
};

const ReviewGridList = props => {
  const large = useMediaQuery('(min-width: 600px)');
  const dispatch = useDispatch();

  const handleReviewClick = useCallback(review => {
    dispatch(openReviewDialog(review));
  });

  return (
    <div>
      {props.showSubheader && (
        <Typography variant="subtitle2" gutterBottom color="textSecondary">
          {`${props.reviews.length} ${I18n.t('reviews count')}`}
        </Typography>
      )}
      <div style={styles.gridContainer}>
        <GridList
          style={styles.gridList}
          cols={props.cols}
          spacing={props.spacing}
          cellHeight={props.cellHeight}
        >
          {props.reviews.map(review => (
            <GridListTile
              key={review.id}
              onClick={() => handleReviewClick(review)}
              style={styles.gridTile}
            >
              {review.image ? (
                <img src={review.image.thumbnail_url} alt={review.spot.name} />
              ) : (
                <GridListTileBar
                  title={
                    <PlaceIcon
                      style={
                        large ? styles.placeIconLarge : styles.placeIconSmall
                      }
                    />
                  }
                  style={styles.tileBar}
                />
              )}
            </GridListTile>
          ))}
        </GridList>
      </div>
    </div>
  );
};

ReviewGridList.defaultProps = {
  cols: 3,
  spacing: 4,
  cellHeight: 100
};

export default React.memo(ReviewGridList);
