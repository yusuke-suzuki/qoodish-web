import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import RateReviewIcon from '@material-ui/icons/RateReview';
import DirectionsIcon from '@material-ui/icons/Directions';
import InfoIcon from '@material-ui/icons/Info';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import CloseIcon from '@material-ui/icons/Close';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Avatar from '@material-ui/core/Avatar';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import Divider from '@material-ui/core/Divider';
import Toolbar from '@material-ui/core/Toolbar';
import PlaceIcon from '@material-ui/icons/Place';
import SwipeableViews from 'react-swipeable-views';
import { Link } from 'react-router-dom';
import I18n from '../containers/I18n';

const styles = {
  drawerPaperLarge: {
    zIndex: 1,
    height: 'calc(100vh - 64px)',
    width: 380,
    marginTop: 64
  },
  drawerPaperSmall: {
    zIndex: 1202,
    height: '100%',
    overflow: 'hidden'
  },
  cardLarge: {
    height: '100%',
    minHeight: 'calc(100vh - 64px)',
    overflowY: 'scroll'
  },
  cardSmall: {
    overflowY: 'scroll',
    minHeight: '100%'
  },
  spotImageLarge: {
    width: '100%',
    objectFit: 'cover',
    height: 380
  },
  spotImageSmall: {
    width: '100%',
    objectFit: 'cover',
    height: 250
  },
  reviewComment: {
    marginRight: 20
  },
  listItem: {
    padding: 0
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    top: 0
  },
  leftButton: {
    marginLeft: 8,
    color: 'white'
  },
  toolbar: {
    backgroundImage: 'linear-gradient(to bottom,rgba(0,0,0,.5),rgba(0,0,0,0))',
    position: 'absolute',
    zIndex: 1,
    right: 0,
    left: 0
  },
  secondaryAvatar: {
    borderRadius: 0,
    marginRight: 12,
    marginTop: 4
  },
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
    return this.props.large ? this.renderDrawer() : this.renderSwipeable();
  }

  renderDrawer() {
    return (
      <Drawer
        variant="persistent"
        anchor="left"
        open={this.props.open}
        PaperProps={{ style: styles.drawerPaperLarge }}
      >
        {this.renderToolbar()}
        {this.props.currentSpot && this.renderSpotCard(this.props.currentSpot)}
      </Drawer>
    );
  }

  renderSwipeable() {
    return (
      <SwipeableDrawer
        anchor="bottom"
        open={this.props.open}
        onClose={this.props.handleClose}
        swipeAreaWidth={0}
        PaperProps={{ style: styles.drawerPaperSmall }}
      >
        {this.renderToolbar()}
        {this.props.currentSpot && this.renderSpotCard(this.props.currentSpot)}
      </SwipeableDrawer>
    );
  }

  renderSpotCard(spot) {
    return (
      <Card style={this.props.large ? styles.cardLarge : styles.cardSmall}>
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
        </CardContent>
        <Divider />
        <BottomNavigation showLabels>
          <BottomNavigationAction
            label={I18n.t('location')}
            icon={<PlaceIcon />}
            onClick={() => this.props.handleLocationButtonClick(spot)}
          />
          <BottomNavigationAction
            label={I18n.t('routes')}
            icon={<DirectionsIcon />}
            onClick={() => this.props.handleRouteButtonClick(spot)}
          />
          <BottomNavigationAction
            label={I18n.t('report')}
            icon={<RateReviewIcon />}
            onClick={() => this.props.handleCreateReviewClick(spot)}
          />
          <BottomNavigationAction
            label={I18n.t('detail')}
            icon={<InfoIcon />}
            component={Link}
            to={`/spots/${spot.place_id}`}
          />
        </BottomNavigation>
        <Divider />
        <List disablePadding>
          {this.renderSpotReviews(this.state.reviews)}
        </List>
      </Card>
    );
  }

  renderReviewImages(reviews) {
    return reviews.map(review => (
      <img
        key={review.id}
        src={review.image ? review.image.url : process.env.SUBSTITUTE_URL}
        style={this.props.large ? styles.spotImageLarge : styles.spotImageSmall}
        alt={review.spot.name}
      />
    ));
  }

  renderSpotReviews(reviews) {
    return reviews.map(review => (
      <ListItem
        button
        key={review.id}
        onClick={() => this.props.handleReviewClick(review)}
      >
        <Avatar
          src={review.author.profile_image_url}
          alt={review.spot.name}
        />
        <ListItemText
          disableTypography={true}
          primary={
            <Typography variant="subtitle1" noWrap>
              {review.author.name}
            </Typography>
          }
          secondary={
            <Typography
              component="p"
              noWrap
              color="textSecondary"
              style={styles.reviewComment}
            >
              {review.comment}
            </Typography>
          }
        />
        {review.image && (
          <ListItemSecondaryAction
            onClick={() => this.props.handleReviewClick(review)}
          >
            <Avatar
              src={review.image.thumbnail_url}
              style={styles.secondaryAvatar}
              alt={review.spot.name}
            />
          </ListItemSecondaryAction>
        )}
      </ListItem>
    ));
  }

  renderToolbar() {
    return (
      <Toolbar style={styles.toolbar} disableGutters>
        {this.renderBackButton()}
      </Toolbar>
    );
  }

  renderBackButton() {
    return (
      <IconButton
        color="inherit"
        onClick={this.props.handleClose}
        style={styles.leftButton}
      >
        {this.props.large ? <ArrowBackIcon /> : <CloseIcon />}
      </IconButton>
    );
  }
}

export default SpotCard;
