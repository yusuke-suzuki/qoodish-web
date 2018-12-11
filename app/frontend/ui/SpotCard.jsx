import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import DirectionsIcon from '@material-ui/icons/Directions';
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
import { Link } from 'react-router-dom';
import I18n from '../containers/I18n';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import Paper from '@material-ui/core/Paper';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ReviewTilesContainer from '../containers/ReviewTilesContainer';
import SpotImageStepperContainer from '../containers/SpotImageStepperContainer';

const styles = {
  drawerPaperLarge: {
    height: 'calc(100vh - 64px)',
    width: 380,
    marginTop: 64
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
  dragHandleContainer: {
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
  reviewTilesContainer: {
    marginTop: 16
  }
};

const SpotBottomNavigation = (props) => {
  return (
    <Paper style={props.large ? styles.bottomNavLarge : {}} elevation={2}>
      <BottomNavigation showLabels>
        <BottomNavigationAction
          label={I18n.t('location')}
          icon={<PlaceIcon />}
          onClick={() => props.handleLocationButtonClick(props.currentSpot)}
          style={styles.bottomAction}
        />
        <BottomNavigationAction
          label={I18n.t('routes')}
          icon={<DirectionsIcon />}
          onClick={() => props.handleRouteButtonClick(props.currentSpot)}
          style={styles.bottomAction}
        />
        <BottomNavigationAction
          label={I18n.t('detail')}
          icon={<InfoIcon />}
          component={Link}
          to={`/spots/${props.currentSpot.place_id}`}
          style={styles.bottomAction}
        />
      </BottomNavigation>
    </Paper>
  );
};

const SpotCardHeader = (props) => {
  return (
    <List disablePadding>
      <ListItem disableGutters style={styles.listItem}>
        <ListItemText
          disableTypography
          primary={
            <Typography variant="h6" noWrap>
              {props.currentSpot.name}
            </Typography>
          }
          secondary={
            <Typography
              component="p"
              noWrap
              color="textSecondary"
            >
              {props.currentSpot.formatted_address}
            </Typography>
          }
        />
      </ListItem>
    </List>
  );
}

const SpotCardSmall = (props) => {
  return (
    <div>
      <CardContent style={styles.cardContentSmall}>
        <div style={styles.dragHandleContainer}>
          <DragHandleIcon color="disabled" />
        </div>
        <SpotCardHeader {...props} />
        <GridList
          cols={2.5}
          cellHeight={100}
          style={styles.gridList}
        >
          <GridListTile
            key="add-review"
            onClick={() => props.handleCreateReviewClick(props.currentSpot)}
          >
            <img src={process.env.SUBSTITUTE_URL} />
            <GridListTileBar
              style={styles.createReviewTile}
              title={
                <AddIcon fontSize="large" />
              }
              subtitle={I18n.t('create new report')}
            />
          </GridListTile>
          {props.spotReviews.map(review => (
            <GridListTile
              key={review.id}
              onClick={() => props.handleReviewClick(review)}
            >
              <img src={review.image ? review.image.thumbnail_url : process.env.SUBSTITUTE_URL} alt={review.spot.name} />
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
      <SpotBottomNavigation {...props} />
    </div>
  );
};

const SpotCardLarge = (props) => {
  return (
    <Card style={styles.cardLarge}>
      <SpotImageStepperContainer
        spotReviews={props.spotReviews}
        currentSpot={props.currentSpot}
      />
      <CardContent>
        <Typography
          variant="h5"
          gutterBottom
        >
          {props.currentSpot.name}
        </Typography>
        <Typography
          variant="subtitle1"
          color="textSecondary"
          gutterBottom
        >
          {props.currentSpot.formatted_address}
        </Typography>
        {props.spotReviews.length > 0 && (
          <div style={styles.reviewTilesContainer}>
            <ReviewTilesContainer
              reviews={props.spotReviews}
              showSubheader
            />
          </div>
        )}
      </CardContent>
      <SpotBottomNavigation {...props} />
    </Card>
  );
};

const SpotCard = (props) => {
  return (
    <SwipeableDrawer
      variant={props.large ? "persistent" : "temporary"}
      anchor={props.large ? "left": "bottom"}
      open={props.open}
      PaperProps={{
        style: props.large ? styles.drawerPaperLarge : {},
        square: props.large ? true : false
      }}
      onOpen={props.handleOpen}
      onClose={props.handleClose}
      disableSwipeToOpen
      disableBackdropTransition
      ModalProps={{ hideBackdrop: true, style: props.large ? {} : styles.modal }}
    >
      {props.large && (
        <Toolbar
          style={styles.toolbar}
          disableGutters
        >
          <IconButton
            color="inherit"
            onClick={props.handleClose}
            style={styles.backButton}
          >
            <ChevronLeftIcon />
          </IconButton>
        </Toolbar>
      )}
      {props.currentSpot && (props.large ? <SpotCardLarge {...props} /> : <SpotCardSmall {...props} />)}
    </SwipeableDrawer>
  );
};

export default SpotCard;
