import React, { useCallback, useEffect } from 'react';
import { useDispatch, useMappedState } from 'redux-react-hook';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import DragHandleIcon from '@material-ui/icons/DragHandle';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';

import openSpotCard from '../../actions/openSpotCard';
import closeSpotCard from '../../actions/closeSpotCard';
import { Link } from '@yusuke-suzuki/rize-router';
import CreateReviewTile from '../molecules/CreateReviewTile';
import ReviewsApi from '@yusuke-suzuki/qoodish-api-js-client/dist/api/ReviewsApi';
import fetchMapSpotReviews from '../../actions/fetchMapSpotReviews';
import clearMapSpotState from '../../actions/clearMapSpotState';
import Skeleton from '@material-ui/lab/Skeleton';

const styles = {
  cardContent: {
    paddingBottom: 16,
    paddingTop: 0
  },
  listItem: {
    paddingTop: 0
  },
  backButton: {
    marginLeft: 'auto',
    marginRight: 8,
    color: 'white'
  },
  toolbar: {
    backgroundImage: 'linear-gradient(to bottom,rgba(0,0,0,.5),rgba(0,0,0,0))',
    position: 'absolute',
    zIndex: 1,
    right: 0,
    left: 0
  },
  modal: {
    height: 0
  },
  dragHandle: {
    textAlign: 'center',
    paddingTop: 2,
    height: 20
  },
  gridList: {
    flexWrap: 'nowrap',
    // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
    transform: 'translateZ(0)',
    '-webkit-overflow-scrolling': 'unset'
  },
  avatarGridTile: {
    width: 30,
    height: 30,
    marginLeft: 8,
    marginRight: 8
  },
  tileBar: {
    height: 50
  },
  infoButton: {
    padding: 0
  }
};

const SpotCardHeader = React.memo(props => {
  const { currentSpot } = props;

  return (
    <List disablePadding>
      <ListItem
        button
        disableGutters
        style={styles.listItem}
        component={Link}
        to={{
          pathname: `/spots/${currentSpot.place_id}`,
          state: { modal: true, spot: currentSpot }
        }}
      >
        <ListItemText
          disableTypography
          primary={
            <Typography variant="h6" noWrap>
              {currentSpot.name}
            </Typography>
          }
          secondary={
            <Typography component="p" noWrap color="textSecondary">
              {currentSpot.formatted_address}
            </Typography>
          }
        />
        <ListItemSecondaryAction>
          <IconButton
            component={Link}
            to={{
              pathname: `/spots/${currentSpot.place_id}`,
              state: { modal: true, spot: currentSpot }
            }}
            style={styles.infoButton}
          >
            <InfoOutlinedIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    </List>
  );
});

const SpotCardContent = React.memo(() => {
  const smUp = useMediaQuery('(min-width: 600px)');
  const mapState = useCallback(
    state => ({
      currentSpot: state.spotCard.currentSpot,
      spotReviews: state.spotCard.spotReviews,
      currentMap: state.mapDetail.currentMap
    }),
    []
  );
  const { currentSpot, spotReviews, currentMap } = useMappedState(mapState);

  return (
    <CardContent style={styles.cardContent}>
      <div style={styles.dragHandle}>
        <DragHandleIcon color="disabled" />
      </div>
      <SpotCardHeader currentSpot={currentSpot} />
      <GridList
        cols={smUp ? 4.5 : 2.5}
        cellHeight={100}
        style={styles.gridList}
      >
        {currentMap.postable && (
          <GridListTile key="add-review">
            <CreateReviewTile currentSpot={currentSpot} />
          </GridListTile>
        )}
        {spotReviews.length < 1 && (
          <GridListTile>
            <Skeleton variant="rect" height={100} />
          </GridListTile>
        )}
        {spotReviews.map(review => (
          <GridListTile
            key={review.id}
            component={Link}
            to={{
              pathname: `/maps/${review.map.id}/reports/${review.id}`,
              state: { modal: true, review: review }
            }}
          >
            <img
              src={
                review.images.length > 0
                  ? review.images[0].thumbnail_url_400
                  : process.env.SUBSTITUTE_URL
              }
              alt={review.spot.name}
              loading="lazy"
            />
            <GridListTileBar
              style={styles.tileBar}
              actionIcon={
                <Avatar
                  src={review.author.profile_image_url}
                  alt={review.author.name}
                  style={styles.avatarGridTile}
                  loading="lazy"
                />
              }
              actionPosition="left"
              subtitle={review.comment}
            />
          </GridListTile>
        ))}
      </GridList>
    </CardContent>
  );
});

const MapSpotDrawer = () => {
  const dispatch = useDispatch();

  const mapState = useCallback(
    state => ({
      open: state.spotCard.spotCardOpen,
      currentSpot: state.spotCard.currentSpot,
      reviewDialogOpen: state.reviews.reviewDialogOpen,
      spotDialogOpen: state.spotDetail.spotDialogOpen,
      mapSummaryOpen: state.mapDetail.mapSummaryOpen,
      spotReviews: state.spotCard.spotReviews
    }),
    []
  );
  const {
    open,
    currentSpot,
    reviewDialogOpen,
    spotDialogOpen,
    mapSummaryOpen,
    spotReviews
  } = useMappedState(mapState);

  const handleOpen = useCallback(() => {
    dispatch(openSpotCard());
  }, [dispatch]);

  const handleClose = useCallback(() => {
    dispatch(closeSpotCard());
  }, [dispatch]);

  const initSpotReviews = useCallback(async () => {
    const apiInstance = new ReviewsApi();

    apiInstance.mapsMapIdSpotsPlaceIdReviewsGet(
      currentSpot.map_id,
      currentSpot.place_id,
      (error, data, response) => {
        if (response.ok) {
          dispatch(fetchMapSpotReviews(response.body));
        }
      }
    );
  }, [dispatch, currentSpot]);

  const clearSpot = useCallback(() => {
    dispatch(clearMapSpotState());
  }, [dispatch]);

  useEffect(() => {
    if (currentSpot.place_id) {
      initSpotReviews();
    }
  }, [currentSpot.place_id]);

  useEffect(() => {
    if (spotReviews.length < 1) {
      handleClose();
    }
  }, [spotReviews]);

  const dialogOpen = reviewDialogOpen || spotDialogOpen || mapSummaryOpen;

  return (
    <SwipeableDrawer
      variant="temporary"
      anchor="bottom"
      open={open && !dialogOpen}
      PaperProps={{
        square: false
      }}
      onOpen={handleOpen}
      onClose={handleClose}
      onExited={clearSpot}
      disableSwipeToOpen
      disableBackdropTransition
      ModalProps={{
        style: styles.modal,
        BackdropProps: {
          invisible: true,
          open: false
        }
      }}
    >
      <SpotCardContent />
    </SwipeableDrawer>
  );
};

export default React.memo(MapSpotDrawer);
