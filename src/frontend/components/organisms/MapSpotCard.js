import React, { useCallback, useEffect } from 'react';
import { useDispatch, useMappedState } from 'redux-react-hook';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';

import IconButton from '@material-ui/core/IconButton';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import InfoIcon from '@material-ui/icons/Info';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import Toolbar from '@material-ui/core/Toolbar';
import PlaceIcon from '@material-ui/icons/Place';
import DragHandleIcon from '@material-ui/icons/DragHandle';
import AddIcon from '@material-ui/icons/Add';
import Link from '../molecules/Link';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import Paper from '@material-ui/core/Paper';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';

import ReviewTiles from './ReviewTiles';
import SpotImageStepper from '../molecules/SpotImageStepper';

import openSpotCard from '../../actions/openSpotCard';
import closeSpotCard from '../../actions/closeSpotCard';
import selectPlaceForReview from '../../actions/selectPlaceForReview';
import requestMapCenter from '../../actions/requestMapCenter';
import switchMap from '../../actions/switchMap';
import fetchMapSpotReviews from '../../actions/fetchMapSpotReviews';
import I18n from '../../utils/I18n';
import initializeApiClient from '../../utils/initializeApiClient';
import { ReviewsApi } from 'qoodish_api';

const styles = {
  drawerPaperLarge: {
    height: 'calc(100vh - 64px)',
    width: 380,
    marginTop: 64,
    zIndex: 1001
  },
  cardLarge: {
    height: '100%',
    minHeight: 'calc(100vh - 64px)',
    overflowY: 'scroll'
  },
  cardContentSmall: {
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
    transform: 'translateZ(0)'
  },
  avatarGridTile: {
    width: 30,
    height: 30,
    marginLeft: 8,
    marginRight: 8
  },
  createReviewTile: {
    height: '100%',
    textAlign: 'center'
  },
  bottomAction: {
    width: '33.3333333333%',
    minWidth: 'auto',
    paddingTop: 8
  },
  tileBar: {
    height: 50
  },
  bottomNavLarge: {
    position: 'absolute',
    bottom: 0,
    width: '100%'
  },
  reviewTiles: {
    marginTop: 16
  }
};

const SpotBottomNavigation = props => {
  const dispatch = useDispatch();
  const large = useMediaQuery('(min-width: 600px)');
  const currentSpot = props.currentSpot;

  const handleLocationButtonClick = useCallback(() => {
    dispatch(requestMapCenter(currentSpot.lat, currentSpot.lng));
    dispatch(switchMap());
  });

  return (
    <Paper style={large ? styles.bottomNavLarge : {}} elevation={2}>
      <BottomNavigation showLabels>
        <BottomNavigationAction
          label={I18n.t('location')}
          icon={<PlaceIcon />}
          onClick={handleLocationButtonClick}
          style={styles.bottomAction}
        />
        <BottomNavigationAction
          label={I18n.t('detail')}
          icon={<InfoIcon />}
          component={Link}
          to={{
            pathname: currentSpot ? `/spots/${currentSpot.place_id}` : '',
            state: { modal: true, spot: currentSpot }
          }}
          style={styles.bottomAction}
        />
      </BottomNavigation>
    </Paper>
  );
};

const SpotCardHeader = props => {
  const { currentSpot } = props;

  return (
    <List disablePadding>
      <ListItem disableGutters style={styles.listItem}>
        <ListItemText
          disableTypography
          primary={
            <Typography variant="h6" noWrap>
              {currentSpot && props.currentSpot.name}
            </Typography>
          }
          secondary={
            <Typography component="p" noWrap color="textSecondary">
              {currentSpot && props.currentSpot.formatted_address}
            </Typography>
          }
        />
      </ListItem>
    </List>
  );
};

const SpotCardSmall = () => {
  const dispatch = useDispatch();
  const mapState = useCallback(
    state => ({
      currentSpot: state.spotCard.currentSpot,
      spotReviews: state.spotCard.spotReviews,
      currentMap: state.mapDetail.currentMap
    }),
    []
  );
  const { currentSpot, spotReviews, currentMap } = useMappedState(mapState);

  const handleCreateReviewClick = useCallback(() => {
    let place = {
      description: currentSpot.name,
      placeId: currentSpot.place_id
    };
    dispatch(selectPlaceForReview(place));
  });

  return (
    <div>
      <CardContent style={styles.cardContentSmall}>
        <div style={styles.dragHandle}>
          <DragHandleIcon color="disabled" />
        </div>
        <SpotCardHeader currentSpot={currentSpot} />
        <GridList cols={2.5} cellHeight={100} style={styles.gridList}>
          {currentMap.postable && currentMap.following && (
            <GridListTile key="add-review" onClick={handleCreateReviewClick}>
              <img src={process.env.SUBSTITUTE_URL} />
              <GridListTileBar
                style={styles.createReviewTile}
                title={<AddIcon fontSize="large" />}
                subtitle={I18n.t('create new report')}
              />
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
                  review.image
                    ? review.image.thumbnail_url
                    : process.env.SUBSTITUTE_URL
                }
                alt={review.spot.name}
              />
              <GridListTileBar
                style={styles.tileBar}
                actionIcon={
                  <Avatar
                    src={review.author.profile_image_url}
                    alt={review.author.name}
                    style={styles.avatarGridTile}
                  />
                }
                actionPosition="left"
                subtitle={review.comment}
              />
            </GridListTile>
          ))}
        </GridList>
      </CardContent>
      <SpotBottomNavigation currentSpot={currentSpot} />
    </div>
  );
};

const SpotCardLarge = () => {
  const mapState = useCallback(
    state => ({
      currentSpot: state.spotCard.currentSpot,
      spotReviews: state.spotCard.spotReviews
    }),
    []
  );
  const { currentSpot, spotReviews } = useMappedState(mapState);

  return (
    <Card style={styles.cardLarge}>
      <SpotImageStepper spotReviews={spotReviews} currentSpot={currentSpot} />
      <CardContent>
        <Typography variant="h5" gutterBottom>
          {currentSpot && currentSpot.name}
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          {currentSpot && currentSpot.formatted_address}
        </Typography>
        {spotReviews.length > 0 && (
          <div style={styles.reviewTiles}>
            <ReviewTiles reviews={spotReviews} showSubheader />
          </div>
        )}
      </CardContent>
      <SpotBottomNavigation currentSpot={currentSpot} />
    </Card>
  );
};

const MapSpotCard = () => {
  const large = useMediaQuery('(min-width: 600px)');
  const dispatch = useDispatch();
  const mapState = useCallback(
    state => ({
      open: state.spotCard.spotCardOpen,
      currentSpot: state.spotCard.currentSpot,
      reviewDialogOpen: state.reviews.reviewDialogOpen,
      spotDialogOpen: state.spotDetail.spotDialogOpen,
      currentMap: state.mapDetail.currentMap,
      spotReviews: state.spotCard.spotReviews
    }),
    []
  );
  const {
    open,
    currentSpot,
    reviewDialogOpen,
    spotDialogOpen,
    currentMap,
    spotReviews
  } = useMappedState(mapState);

  const handleOpen = useCallback(() => {
    dispatch(openSpotCard());
  });

  const handleClose = useCallback(() => {
    dispatch(closeSpotCard());
  });

  useEffect(
    () => {
      if (spotReviews.length < 1) {
        handleClose();
      }
    },
    [spotReviews]
  );

  const dialogOpen = reviewDialogOpen || spotDialogOpen;

  const refreshReviews = useCallback(async () => {
    await initializeApiClient();
    const apiInstance = new ReviewsApi();

    apiInstance.mapsMapIdReviewsGet(
      currentMap.id,
      { placeId: currentSpot.place_id },
      (error, data, response) => {
        if (response.ok) {
          dispatch(fetchMapSpotReviews(response.body));
        }
      }
    );
  });

  useEffect(
    () => {
      if (currentMap && currentSpot) {
        refreshReviews();
      }
    },
    [currentMap, currentSpot]
  );

  return (
    <SwipeableDrawer
      variant={large ? 'persistent' : 'temporary'}
      anchor={large ? 'left' : 'bottom'}
      open={large ? open : open && !dialogOpen}
      PaperProps={{
        style: large ? styles.drawerPaperLarge : {},
        square: large ? true : false
      }}
      onOpen={handleOpen}
      onClose={handleClose}
      disableSwipeToOpen
      disableBackdropTransition
      ModalProps={{
        hideBackdrop: true,
        style: large ? {} : styles.modal
      }}
    >
      {large && (
        <Toolbar style={styles.toolbar} disableGutters>
          <IconButton
            color="inherit"
            onClick={handleClose}
            style={styles.backButton}
          >
            <ChevronLeftIcon />
          </IconButton>
        </Toolbar>
      )}
      {currentSpot && (large ? <SpotCardLarge /> : <SpotCardSmall />)}
    </SwipeableDrawer>
  );
};

export default React.memo(MapSpotCard);
