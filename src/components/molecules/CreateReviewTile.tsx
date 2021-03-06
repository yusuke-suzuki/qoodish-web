import React, { memo, useCallback } from 'react';
import { useDispatch } from 'redux-react-hook';

import AddIcon from '@material-ui/icons/Add';
import GridListTileBar from '@material-ui/core/GridListTileBar';

import openPlaceSelectDialog from '../../actions/openPlaceSelectDialog';
import selectPlaceForReview from '../../actions/selectPlaceForReview';
import I18n from '../../utils/I18n';

const styles = {
  createReviewTile: {
    height: '100%',
    textAlign: 'center'
  }
};

type Props = {
  currentSpot: any;
};

export default memo(function CreateReviewTile(props: Props) {
  const dispatch = useDispatch();
  const { currentSpot } = props;

  const handleCreateReviewClick = useCallback(() => {
    if (currentSpot) {
      dispatch(
        selectPlaceForReview({
          description: currentSpot.name,
          placeId: currentSpot.place_id
        })
      );
    } else {
      dispatch(openPlaceSelectDialog());
    }
  }, [dispatch, currentSpot]);

  return (
    <div key="add-review" onClick={handleCreateReviewClick}>
      <GridListTileBar
        style={styles.createReviewTile}
        title={<AddIcon fontSize="large" />}
        subtitle={I18n.t('create new report')}
      />
    </div>
  );
});
