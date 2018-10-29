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
import SwipeableViews from 'react-swipeable-views';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import Paper from '@material-ui/core/Paper';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ReviewTilesContainer from '../containers/ReviewTilesContainer';

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
  spotImage: {
    width: '100%',
    objectFit: 'cover',
    height: 250
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

class SpotCard extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      reviews: []
    };
  }

  componentWillReceiveProps(nextProps) {
    let reviews = nextProps.mapReviews.filter(review => {
      return review.place_id === nextProps.currentSpot.place_id;
    });
    this.setState(Object.assign(this.state.reviews, reviews));
  }

  render() {
    return this.renderDrawer();
  }

  renderDrawer() {
    return (
      <SwipeableDrawer
        variant={this.props.large ? "persistent" : "temporary"}
        anchor={this.props.large ? "left": "bottom"}
        open={this.props.open}
        PaperProps={{
          style: this.props.large ? styles.drawerPaperLarge : {},
          square: this.props.large ? true : false
        }}
        onOpen={this.props.handleOpen}
        onClose={this.props.handleClose}
        disableSwipeToOpen
        disableBackdropTransition
        ModalProps={{ hideBackdrop: true, style: this.props.large ? {} : styles.modal }}
      >
        {this.props.large && this.renderToolbar()}
        {this.props.currentSpot && this.renderSpotCard(this.props.currentSpot)}
      </SwipeableDrawer>
    );
  }

  renderSpotCard(spot) {
    return this.props.large ? this.renderSpotCardLarge(spot) : this.renderSpotCardSmall(spot);
  }

  renderSpotCardLarge(spot) {
    return (
      <Card style={styles.cardLarge}>
        <CardMedia>
          <SwipeableViews>
            {this.renderReviewImages(this.state.reviews)}
          </SwipeableViews>
        </CardMedia>
        <CardContent>
          <Typography
            variant="h5"
            gutterBottom
          >
            {spot.name}
          </Typography>
          <Typography
            variant="subtitle1"
            color="textSecondary"
            gutterBottom
          >
            {spot.formatted_address}
          </Typography>
          {this.state.reviews.length > 0 && (
            <div style={styles.reviewTilesContainer}>
              <ReviewTilesContainer
                reviews={this.state.reviews}
                showSubheader
              />
            </div>
          )}
        </CardContent>
        {this.renderBottomNavigation(spot)}
      </Card>
    );
  }

  renderBottomNavigation(spot) {
    return (
      <Paper style={this.props.large ? styles.bottomNavLarge : {}} elevation={2}>
        <BottomNavigation showLabels>
          <BottomNavigationAction
            label={I18n.t('location')}
            icon={<PlaceIcon />}
            onClick={() => this.props.handleLocationButtonClick(spot)}
            style={styles.bottomAction}
          />
          <BottomNavigationAction
            label={I18n.t('routes')}
            icon={<DirectionsIcon />}
            onClick={() => this.props.handleRouteButtonClick(spot)}
            style={styles.bottomAction}
          />
          <BottomNavigationAction
            label={I18n.t('detail')}
            icon={<InfoIcon />}
            component={Link}
            to={`/spots/${spot.place_id}`}
            style={styles.bottomAction}
          />
        </BottomNavigation>
      </Paper>
    );
  }

  renderSpotCardSmall(spot) {
    return (
      <div>
        <CardContent style={styles.cardContentSmall}>
          <div style={styles.dragHandleContainer}>
            <DragHandleIcon color="disabled" />
          </div>
          {this.renderCardHeader(spot)}
          <GridList
            cols={2.5}
            cellHeight={100}
            style={styles.gridList}
          >
            {this.renderCreateReviewTile(spot)}
            {this.renderReviewTiles(this.state.reviews)}
          </GridList>
        </CardContent>
        {this.renderBottomNavigation(spot)}
      </div>
    );
  }

  renderCardHeader(spot) {
    return (
      <List disablePadding>
        <ListItem disableGutters style={styles.listItem}>
          <ListItemText
            disableTypography
            primary={
              <Typography variant="h6" noWrap>
                {spot.name}
              </Typography>
            }
            secondary={
              <Typography
                component="p"
                noWrap
                color="textSecondary"
              >
                {spot.formatted_address}
              </Typography>
            }
          />
        </ListItem>
      </List>
    );
  }

  renderCreateReviewTile(spot) {
    return (
      <GridListTile
        key="add-review"
        onClick={() => this.props.handleCreateReviewClick(spot)}
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
    );
  }

  renderReviewTiles(reviews) {
    return reviews.map(review => (
      <GridListTile
        key={review.id}
        onClick={() => this.props.handleReviewClick(review)}
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
    ));
  }

  renderReviewImages(reviews) {
    return reviews.map(review => (
      <img
        key={review.id}
        src={review.image ? review.image.url : process.env.SUBSTITUTE_URL}
        style={styles.spotImage}
        alt={review.spot.name}
      />
    ));
  }

  renderToolbar() {
    return (
      <Toolbar
        style={styles.toolbar}
        disableGutters
      >
        {this.renderBackButton()}
      </Toolbar>
    );
  }

  renderBackButton() {
    return (
      <IconButton
        color="inherit"
        onClick={this.props.handleClose}
        style={styles.backButton}
      >
        <ChevronLeftIcon />
      </IconButton>
    );
  }
}

export default SpotCard;
