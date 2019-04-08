import React, { useCallback, useEffect } from 'react';
import { useDispatch, useMappedState } from 'redux-react-hook';

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
import AddIcon from '@material-ui/icons/Add';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';

import openSpotCard from '../../actions/openSpotCard';
import closeSpotCard from '../../actions/closeSpotCard';
import selectPlaceForReview from '../../actions/selectPlaceForReview';
import I18n from '../../utils/I18n';
import Link from '../molecules/Link';

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
  tileBar: {
    height: 50
  },
  infoButton: {
    padding: 0
  }
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
              {currentSpot && currentSpot.name}
            </Typography>
          }
          secondary={
            <Typography component="p" noWrap color="textSecondary">
              {currentSpot && props.currentSpot.formatted_address}
            </Typography>
          }
        />
        <ListItemSecondaryAction>
          <IconButton
            component={Link}
            to={{
              pathname: currentSpot ? `/spots/${currentSpot.place_id}` : '',
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
};

const SpotCardContent = () => {
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
          {currentMap.postable && (
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
    </div>
  );
};

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
      disableSwipeToOpen
      disableBackdropTransition
      ModalProps={{
        hideBackdrop: true,
        style: styles.modal
      }}
    >
      {currentSpot && <SpotCardContent />}
    </SwipeableDrawer>
  );
};

export default React.memo(MapSpotDrawer);